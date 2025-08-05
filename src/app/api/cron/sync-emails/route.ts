import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { searchJobEmails } from '@/lib/gmail';
import { analyzeJobEmail } from '@/lib/gemini';
import JobApplication, { JobStatus } from '@/models/JobApplication';
import GmailAuth from '@/models/GmailAuth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const gmailAuths = await GmailAuth.find({ isActive: true });

    const results = {
      usersProcessed: 0,
      totalEmailsProcessed: 0,
      totalJobsUpdated: 0,
      totalNewJobsCreated: 0,
      errors: [] as string[]
    };

    for (const gmailAuth of gmailAuths) {
      try {
        results.usersProcessed++;

        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        if (gmailAuth.lastSync && gmailAuth.lastSync > twoHoursAgo) {
          continue;
        }

        const emails = await searchJobEmails(
          gmailAuth.userId,
          gmailAuth.lastSync
        );

        for (const email of emails) {
          try {
            results.totalEmailsProcessed++;

            const analysis = await analyzeJobEmail(
              email.subject,
              email.from,
              email.body,
              email.snippet
            );

            if (!analysis.isJobRelated || analysis.confidence < 0.7) {
              continue;
            }

            let jobApplication = null;

            if (analysis.company && analysis.position) {
              jobApplication = await JobApplication.findOne({
                userId: gmailAuth.userId,
                company: { $regex: new RegExp(analysis.company, 'i') },
                position: { $regex: new RegExp(analysis.position, 'i') }
              });
            }

            if (jobApplication) {
              const updateData: any = {
                lastUpdated: new Date(),
                emailThreadId: email.threadId
              };

              if (
                analysis.status &&
                shouldUpdateStatus(jobApplication.status, analysis.status)
              ) {
                updateData.status = analysis.status;
              }

              if (analysis.extractedInfo.location && !jobApplication.location) {
                updateData.location = analysis.extractedInfo.location;
              }

              if (
                analysis.extractedInfo.contactEmail &&
                !jobApplication.contactEmail
              ) {
                updateData.contactEmail = analysis.extractedInfo.contactEmail;
              }

              if (analysis.extractedInfo.salary && !jobApplication.salary) {
                updateData.salary = analysis.extractedInfo.salary;
              }

              const emailSummary = `\n\n[Auto-updated ${new Date().toLocaleDateString()}]\n${analysis.summary}`;
              updateData.notes = (jobApplication.notes || '') + emailSummary;

              if (analysis.extractedInfo.interviewDate) {
                const interviewDate = new Date(
                  analysis.extractedInfo.interviewDate
                );
                if (!isNaN(interviewDate.getTime())) {
                  updateData.$push = {
                    interviews: {
                      date: interviewDate,
                      type: 'unknown',
                      notes: `Auto-scheduled: ${analysis.summary}`
                    }
                  };
                }
              }

              await JobApplication.findByIdAndUpdate(
                jobApplication._id,
                updateData
              );
              results.totalJobsUpdated++;
            } else if (
              analysis.company &&
              analysis.position &&
              analysis.confidence > 0.8
            ) {
              const newJob = new JobApplication({
                userId: gmailAuth.userId,
                company: analysis.company,
                position: analysis.position,
                status: analysis.status || JobStatus.APPLIED,
                applicationDate: email.date,
                emailThreadId: email.threadId,
                location: analysis.extractedInfo.location,
                contactEmail: analysis.extractedInfo.contactEmail,
                salary: analysis.extractedInfo.salary,
                notes: `[Auto-created from email]\n${analysis.summary}`
              });

              await newJob.save();
              results.totalNewJobsCreated++;
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            console.error(
              `Error processing email ${email.id} for user ${gmailAuth.userId}:`,
              error
            );
            results.errors.push(
              `User ${gmailAuth.userId}: Failed to process email ${email.subject} - ${errorMessage}`
            );
          }
        }

        await GmailAuth.findByIdAndUpdate(gmailAuth._id, {
          lastSync: new Date()
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing user ${gmailAuth.userId}:`, error);
        results.errors.push(
          `Failed to process user ${gmailAuth.userId} - ${errorMessage}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: errorMessage },
      { status: 500 }
    );
  }
}

function shouldUpdateStatus(
  currentStatus: JobStatus,
  newStatus: JobStatus
): boolean {
  const statusProgression = [
    JobStatus.APPLIED,
    JobStatus.SCREENING,
    JobStatus.INTERVIEW,
    JobStatus.OFFER
  ];

  const currentIndex = statusProgression.indexOf(currentStatus);
  const newIndex = statusProgression.indexOf(newStatus);

  return (
    newIndex > currentIndex ||
    newStatus === JobStatus.REJECTED ||
    newStatus === JobStatus.WITHDRAWN
  );
}
