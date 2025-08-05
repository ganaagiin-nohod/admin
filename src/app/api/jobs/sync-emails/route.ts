import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { searchJobEmails } from '@/lib/gmail';
import { analyzeJobEmail } from '@/lib/gemini';
import JobApplication, { JobStatus } from '@/models/JobApplication';
import GmailAuth from '@/models/GmailAuth';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const gmailAuth = await GmailAuth.findOne({ userId, isActive: true });
    if (!gmailAuth) {
      return NextResponse.json(
        { error: 'Gmail not connected' },
        { status: 400 }
      );
    }

    const lastSync = gmailAuth.lastSync;

    const emails = await searchJobEmails(userId, lastSync);

    const syncResults = {
      emailsProcessed: 0,
      jobsUpdated: 0,
      newJobsCreated: 0,
      errors: [] as string[]
    };

    for (const email of emails) {
      try {
        syncResults.emailsProcessed++;

        const analysis = await analyzeJobEmail(
          email.subject,
          email.from,
          email.body,
          email.snippet
        );

        if (!analysis.isJobRelated || analysis.confidence < 0.6) {
          continue;
        }

        let jobApplication = null;

        if (analysis.company && analysis.position) {
          jobApplication = await JobApplication.findOne({
            userId,
            company: { $regex: new RegExp(analysis.company, 'i') },
            position: { $regex: new RegExp(analysis.position, 'i') }
          });
        }

        if (jobApplication) {
          const updateData: any = {
            lastUpdated: new Date(),
            emailThreadId: email.threadId
          };

          if (analysis.status && analysis.status !== jobApplication.status) {
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

          const emailSummary = `\n\n[Auto-updated from email on ${new Date().toLocaleDateString()}]\n${analysis.summary}`;
          if (analysis.extractedInfo.nextSteps) {
            updateData.notes =
              (jobApplication.notes || '') +
              emailSummary +
              `\nNext steps: ${analysis.extractedInfo.nextSteps}`;
          } else {
            updateData.notes = (jobApplication.notes || '') + emailSummary;
          }

          if (analysis.extractedInfo.interviewDate) {
            const interviewDate = new Date(
              analysis.extractedInfo.interviewDate
            );
            if (!isNaN(interviewDate.getTime())) {
              updateData.$push = {
                interviews: {
                  date: interviewDate,
                  type: 'unknown',
                  notes: `Scheduled via email: ${analysis.summary}`
                }
              };
            }
          }

          await JobApplication.findByIdAndUpdate(
            jobApplication._id,
            updateData
          );
          syncResults.jobsUpdated++;
        } else if (analysis.company && analysis.position) {
          const newJob = new JobApplication({
            userId,
            company: analysis.company,
            position: analysis.position,
            status: analysis.status || JobStatus.APPLIED,
            applicationDate: email.date,
            emailThreadId: email.threadId,
            location: analysis.extractedInfo.location,
            contactEmail: analysis.extractedInfo.contactEmail,
            salary: analysis.extractedInfo.salary,
            notes: `[Auto-created from email]\n${analysis.summary}${
              analysis.extractedInfo.nextSteps
                ? `\nNext steps: ${analysis.extractedInfo.nextSteps}`
                : ''
            }`
          });

          if (analysis.extractedInfo.interviewDate) {
            const interviewDate = new Date(
              analysis.extractedInfo.interviewDate
            );
            if (!isNaN(interviewDate.getTime())) {
              newJob.interviews = [
                {
                  date: interviewDate,
                  type: 'unknown',
                  notes: `Scheduled via email: ${analysis.summary}`
                }
              ];
            }
          }

          await newJob.save();
          syncResults.newJobsCreated++;
        }
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        syncResults.errors.push(`Failed to process email: ${email.subject}`);
      }
    }

    await GmailAuth.findByIdAndUpdate(gmailAuth._id, {
      lastSync: new Date()
    });

    return NextResponse.json({
      success: true,
      ...syncResults
    });
  } catch (error) {
    console.error('Error syncing emails:', error);
    return NextResponse.json(
      { error: 'Failed to sync emails' },
      { status: 500 }
    );
  }
}
