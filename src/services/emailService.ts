import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import React from "react";
import { render } from "@react-email/render";

type MailUser = { email: string; name: string };

type ReminderTemplateProps = {
  userName: string;
  dueCount: number;
  streakCurrent: number;
};

function FallbackWelcomeEmail({ userName }: { userName: string }) {
  return React.createElement(
    "html",
    null,
    React.createElement(
      "body",
      null,
      React.createElement("h1", null, "Welcome to Flashcard Engine"),
      React.createElement("p", null, `Hi ${userName}, your account is ready.`)
    )
  );
}

function FallbackDailyReminderEmail({
  userName,
  dueCount,
  streakCurrent,
}: ReminderTemplateProps) {
  return React.createElement(
    "html",
    null,
    React.createElement(
      "body",
      null,
      React.createElement("h1", null, "Daily Review Reminder"),
      React.createElement("p", null, `Hi ${userName}, you have ${dueCount} cards due today.`),
      React.createElement("p", null, `Current streak: ${streakCurrent}`)
    )
  );
}

async function getTemplates() {
  return {
    WelcomeEmail: FallbackWelcomeEmail,
    DailyReminderEmail: FallbackDailyReminderEmail,
  };
}

export async function sendWelcomeEmail(user: {
  email: string;
  name: string;
}): Promise<void> {
  try {
    const { WelcomeEmail } = await getTemplates();
    const htmlContent = await render(
      React.createElement(WelcomeEmail, { userName: user.name })
    );

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: user.email,
      subject: "Welcome to Flashcard Engine ",
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendDailyReminder(
  user: { email: string; name: string },
  dueCount: number,
  streakCurrent: number
): Promise<void> {
  try {
    const { DailyReminderEmail } = await getTemplates();
    const htmlContent = await render(
      React.createElement(DailyReminderEmail, {
        userName: user.name,
        dueCount,
        streakCurrent,
      })
    );

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: user.email,
      subject: `You have ${dueCount} cards to review today`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send daily reminder:", error);
  }
}

export async function sendBulkReminders(): Promise<{ sent: number; failed: number }> {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: {
      reminderEnabled: true,
      OR: [{ lastStudiedAt: null }, { lastStudiedAt: { lt: todayMidnight } }],
    },
    select: {
      id: true,
      email: true,
      name: true,
      streakCurrent: true,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const dueCount = await prisma.card.count({
        where: {
          deck: {
            userId: user.id,
            archived: false,
          },
          OR: [{ nextReviewDate: { lte: new Date() } }, { isNew: true }],
        },
      });

      if (dueCount <= 0) {
        continue;
      }

      const displayName = user.name ?? "Learner";
      const { DailyReminderEmail } = await getTemplates();
      const htmlContent = await render(
        React.createElement(DailyReminderEmail, {
          userName: displayName,
          dueCount,
          streakCurrent: user.streakCurrent,
        })
      );

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: user.email,
        subject: `You have ${dueCount} cards to review today`,
        html: htmlContent,
      });

      sent += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to send reminder to ${user.email}:`, error);
    }
  }

  return { sent, failed };
}
