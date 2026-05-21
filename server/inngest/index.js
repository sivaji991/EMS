import { Inngest } from "inngest";

import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

import sendEmail from "../config/nodemailer.js";

// Create Inngest Client
export const inngest = new Inngest({
  id: "fullstack-ems-sivaji",
});

// Auto check-out function

const autoCheckOut = inngest.createFunction(
  {
    id: "auto-check-out",
    triggers: [
      {
        event: "employee/check-out",
      },
    ],
  },

  async ({ event, step }) => {

    const { employeeId, attendanceId } =
      event.data;

    // Wait for 9 hours
    await step.sleepUntil(
      "wait-for-9-hours",
      new Date(
        Date.now() +
        9 * 60 * 60 * 1000
      )
    );

    // Get attendance
    let attendance =
      await Attendance.findById(
        attendanceId
      );

    // If already checked out → stop
    if (!attendance || attendance.checkOut) {
      return;
    }

    // Get employee
    const employee =
      await Employee.findById(
        employeeId
      );

    if (!employee) {
      return;
    }

    // Send reminder email
    await sendEmail({
      to: employee.email,
      subject:
        "Attendance Check-out Reminder",
      body: `
        <div style="max-width: 600px; font-family: Arial, sans-serif;">

          <h2>
            Hi ${employee.firstName},
          </h2>

          <p style="font-size: 16px;">
            You checked in to the
            ${employee.department}
            department today.
          </p>

          <p style="
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
            margin: 8px 0;
          ">
            ${attendance?.checkIn?.toLocaleTimeString()}
          </p>

          <p style="font-size: 16px;">
            Please make sure to check out
            within one hour.
          </p>
          <br />
          <p style="font-size: 16px;">
            Best Regards,
          </p>

          <p style="font-size: 16px;">
            EMS
          </p>

        </div>
      `,
    });

    // Wait 1 more hour
    await step.sleepUntil(
      "wait-for-1-hour",
      new Date(
        Date.now() +
        1 * 60 * 60 * 1000
      )
    );

    // Fetch again
    attendance =
      await Attendance.findById(
        attendanceId
      );

    // If still not checked out
    if (attendance && !attendance.checkOut) {

      attendance.checkOut = new Date(
        new Date(
          attendance.checkIn
        ).getTime() +
        10 * 60 * 60 * 1000
      );
      attendance.workingHours = 10;
      attendance.dayType = "Full Day";
      attendance.status = "LATE";

      await attendance.save();
    }
  }
);

// Leave application reminder

const leaveApplicationReminder =
  inngest.createFunction(

    {
      id: "leave-application-reminder",

      triggers: [
        {
          event: "leave/pending",
        },
      ],
    },

    async ({ event, step }) => {

      const { leaveApplicationId } =
        event.data;

      // Wait 24 hours
      await step.sleepUntil(
        "wait-for-24-hours",
        new Date(
          Date.now() +
          24 * 60 * 60 * 1000
        )
      );

      // Get leave application
      const leaveApplication =
        await LeaveApplication.findById(
          leaveApplicationId
        );

      // If already processed → stop
      if (
        !leaveApplication ||
        leaveApplication.status !== "PENDING"
      ) {
        return;
      }

      // Get employee
      const employee =
        await Employee.findById(
          leaveApplication.employeeId
        );

      if (!employee) {
        return;
      }

      // Send reminder email
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject:
          "Leave Application Reminder",
        body: `
          <div style="max-width: 600px; font-family: Arial, sans-serif;">
            <h2>
              Hi Admin,
            </h2>
            <p style="font-size: 16px;">
              A leave request is pending
              for the
              ${employee.department}
              department.
            </p>

            <p style="
              font-size: 18px;
              font-weight: bold;
              color: #007bff;
              margin: 8px 0;
            ">
              ${leaveApplication?.startDate?.toLocaleDateString()}
            </p>

            <p style="font-size: 16px;">
              Please review and take action
              on this leave request.
            </p>

            <br />

            <p style="font-size: 16px;">
              Best Regards,
            </p>

            <p style="font-size: 16px;">
              EMS
            </p>

          </div>
        `,
      });
    }
  );

// Attendance reminder CRON

const attendanceReminderCron =
  inngest.createFunction(

    {
      id: "attendance-reminder-cron",

      triggers: [
        {
          cron:
            "TZ=Asia/Kolkata 30 11 * * *",
        },
      ],
    },

    async ({ step }) => {

      // STEP 1 — Today date range

      const today = await step.run(
  "get-today-date",

  () => {

    // Current UTC time
    const now = new Date();

    // IST offset in milliseconds
    const IST_OFFSET =
      5.5 * 60 * 60 * 1000;

    // Convert UTC -> IST
    const istTime =
      new Date(
        now.getTime() +
        IST_OFFSET
      );

    // Create IST midnight
    const startUTC = new Date(
      Date.UTC(
        istTime.getUTCFullYear(),
        istTime.getUTCMonth(),
        istTime.getUTCDate(),
        0,
        0,
        0
      ) - IST_OFFSET
    );

    // End of day
    const endUTC = new Date(
      startUTC.getTime() +
      24 * 60 * 60 * 1000
    );

    return {
      startUTC:
        startUTC.toISOString(),

      endUTC:
        endUTC.toISOString(),
    };
  }
);

      // STEP 2 — Active employees

      const activeEmployees =
        await step.run(
          "get-active-employees",

          async () => {

            const employees =
              await Employee.find({
                isDeleted: false,
                employmentStatus:
                  "ACTIVE",
              }).lean();

            return employees.map((e) => ({
              _id:
                e._id.toString(),
              firstName:
                e.firstName,
              lastName:
                e.lastName,
              email:
                e.email,
              department:
                e.department,
            }));
          }
        );

      // STEP 3 — Employees on leave

      const onLeaveIds =
        await step.run(
          "get-on-leave-ids",

          async () => {

            const leaves =
              await LeaveApplication.find({
                status: "APPROVED",

                $and: [
                  {
                    startDate: {
                      $lte: new Date(today.endUTC)
                    }
                  },
                  {
                    endDate: {
                      $gte: new Date(today.startUTC)
                    }
                  }
                ],
              }).lean();

            return leaves.map((l) =>
              l.employeeId.toString()
            );
          }
        );

      // STEP 4 — Checked-in employees

      const checkedInIds =
        await step.run(
          "get-checked-in-ids",

          async () => {

            const attendances =
              await Attendance.find({
                date: {
                  $gte:
                    new Date(
                      today.startUTC
                    ),

                  $lt:
                    new Date(
                      today.endUTC
                    ),
                },
              }).lean();

            return attendances.map((a) =>
              a.employeeId.toString()
            );
          }
        );

      // STEP 5 — Absent employees

      const absentEmployees =
        activeEmployees.filter(
          (emp) =>
            !onLeaveIds.includes(emp._id) &&
            !checkedInIds.includes(emp._id)
        );

      // STEP 6 — Send emails

      if (absentEmployees.length > 0) {

        await step.run(
          "send-reminder-emails",

          async () => {

            await Promise.all(

              absentEmployees.map(
                (emp) => {

                  return sendEmail({
                    to: emp.email,
                    subject:
                      "Attendance Reminder -- Please Mark Your Attendance",
                    body: `
                      <div style="
                        max-width: 600px;
                        font-family: Arial, sans-serif;
                      ">
                        <h2>
                          Hi ${emp.firstName},
                        </h2>
                        <p style="font-size: 16px;">
                          We noticed that you
                          have not marked your
                          attendance today.
                        </p>

                        <p style="font-size: 16px;">
                          The attendance deadline
                          was
                          <strong>
                            11:30 AM
                          </strong>.
                        </p>

                        <p style="font-size: 16px;">
                          Please check in as soon
                          as possible or contact
                          your admin if you are
                          facing any issue.
                        </p>
                        <br />
                        <p style="
                          font-size: 14px;
                          color: #666;
                        ">
                          Department:
                          ${emp.department}
                        </p>

                        <br />

                        <p style="font-size: 16px;">
                          Best Regards,
                        </p>

                        <p style="font-size: 16px;">
                          <strong>
                            QuickEMS
                          </strong>
                        </p>

                      </div>
                    `,
                  });

                }
              )
            );
          }
        );
      }

      return {
        totalActive:
          activeEmployees.length,
        onLeave:
          onLeaveIds.length,
        checkedIn:
          checkedInIds.length,
        absent:
          absentEmployees.length,
      };
    }
  );

// Export functions

export const functions = [
  autoCheckOut,
  leaveApplicationReminder,
  attendanceReminderCron,
];