import { IWebsite } from '@/models/Website';

export interface DeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  error?: string;
}

export class VercelDeployer {
  private vercelToken: string;
  private teamId?: string;

  constructor(vercelToken: string, teamId?: string) {
    this.vercelToken = vercelToken;
    this.teamId = teamId;
  }

  async deployWebsite(
    website: IWebsite,
    projectFiles: Record<string, string>
  ): Promise<DeploymentResult> {
    try {
      // Create deployment
      const deployment = await this.createDeployment(website, projectFiles);

      if (deployment.error) {
        return { success: false, error: deployment.error };
      }

      // Wait for deployment to complete
      const deploymentUrl = await this.waitForDeployment(deployment.id);

      return {
        success: true,
        url: deploymentUrl,
        deploymentId: deployment.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createDeployment(
    website: IWebsite,
    files: Record<string, string>
  ) {
    const deploymentData = {
      name: website.slug,
      files: Object.entries(files).map(([path, content]) => ({
        file: path,
        data: Buffer.from(content).toString('base64')
      })),
      projectSettings: {
        framework: 'nextjs',
        buildCommand: 'npm run build',
        outputDirectory: 'out'
      },
      target: 'production'
    };

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
        ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
      },
      body: JSON.stringify(deploymentData)
    });

    return await response.json();
  }

  private async waitForDeployment(deploymentId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    while (attempts < maxAttempts) {
      const response = await fetch(
        `https://api.vercel.com/v13/deployments/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
          }
        }
      );

      const deployment = await response.json();

      if (deployment.readyState === 'READY') {
        return `https://${deployment.url}`;
      }

      if (deployment.readyState === 'ERROR') {
        throw new Error('Deployment failed');
      }

      // Wait 10 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('Deployment timeout');
  }

  async createProject(
    website: IWebsite
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      const projectData = {
        name: website.slug,
        framework: 'nextjs',
        gitRepository: null, // No git repo, we'll deploy directly
        publicSource: false
      };

      const response = await fetch('https://api.vercel.com/v9/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json',
          ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
        },
        body: JSON.stringify(projectData)
      });

      const project = await response.json();

      if (response.ok) {
        return { success: true, projectId: project.id };
      } else {
        return {
          success: false,
          error: project.error?.message || 'Failed to create project'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async assignDomain(
    projectId: string,
    domain: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/domains`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json',
            ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
          },
          body: JSON.stringify({ name: domain })
        }
      );

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'Failed to assign domain'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
