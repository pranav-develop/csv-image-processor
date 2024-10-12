import { Job, JobStatus, UploadedFile } from "@prisma/client";
import DBClient from "config/DBClient";
import { JobTypes } from "types/JobTypes";

export default class JobService {
  private static async startJob(job: Job) {
    try {
      // Updating the job status to IN_PROGRESS
      await DBClient.getInstance().job.update({
        where: { id: job.id },
        data: { status: JobStatus.IN_PROGRESS },
      });

      // Processing the job
      // This is a dummy function that waits for 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Updating the job status to COMPLETED
      await DBClient.getInstance().job.update({
        where: { id: job.id },
        data: { status: JobStatus.COMPLETED },
      });

      // Calling the job completed callback
      // TODO: Fire a webhook
    } catch (e) {
      console.log(e);
      // Saving the error status
      await DBClient.getInstance().job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          error: {
            message: e.message,
            stack: e.stack,
          },
        },
      });
    }
  }

  public static async createJob(props: JobTypes.CreateJobInput) {
    // Creating job of type ProductCSVUpload as there is only one type of job
    const job = await DBClient.getInstance().job.create({
      data: {
        fileId: props.data.file.id,
        type: props.type,
      },
    });

    JobService.startJob(job);

    return job;
  }

  public static async getJobById({ id }: { id: string }) {
    return await DBClient.getInstance().job.findUnique({
      where: { id },
    });
  }
}
