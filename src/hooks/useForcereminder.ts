import useAuth from "./useAuth";
import { useMutation } from "@tanstack/react-query";

export interface SendReminderParams {
  submissionId: string;
  recipients: string[] | string;
  subject: string;
  content: string;
}

export default function useForcereminder() {
  const { request } = useAuth();

  const { mutateAsync: sendReminder, isPending: isSendingReminder } =
    useMutation({
      mutationKey: ["/submissionsData/sendReminder"],
      mutationFn: async ({
        submissionId,
        recipients,
        subject,
        content,
      }: SendReminderParams) => {
        const response = await request.post(
          `/submissionsData/${submissionId}/send-reminder`,
          { recipients, subject, content }
        );
        return response.data;
      },
    });

  return {
    sendReminder,
    isSendingReminder,
  };
}
