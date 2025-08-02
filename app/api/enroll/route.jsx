// app/api/enroll/route.js
import { db } from "@/config/db";
import { coursesTable, enrollmentsTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm"; // desc import is included as per user's provided GET route
import { NextResponse } from "next/server";

export async function POST(request) {
    const {courseId} = await request.json();
    const user = await currentUser();

    //checking course enrollment
    const enrollment = await db.select().from(enrollmentsTable).where(and(eq(
        enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress
    ), eq(        enrollmentsTable.cid, courseId
    )))

    if (enrollment.length == 0) {
        const result = await db.insert(enrollmentsTable).values({
            cid: courseId,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            // completedChapters is not explicitly set here, so it will use the default from schema
        }).returning(enrollmentsTable);

        return NextResponse.json(result)
    }

    return NextResponse.json({ alreadyEnrolled: true });
}

export async function GET(request) {
    const user = await currentUser();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams?.get('courseId');
    if (courseId) {
        const result = await db.select().from(coursesTable)
            .innerJoin(enrollmentsTable, eq(coursesTable.cid, enrollmentsTable.cid))
            .where(and(eq(enrollmentsTable.cid, courseId), eq(enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress)));

        return NextResponse.json(result[0]);
    } else {
    // Fetching enrolled courses for the user
    // NOTE: The orderBy(desc(enrollmentsTable.id)) below can sometimes cause 404/500 errors
    // if a database index is missing. If you encounter issues, consider removing it
    // and sorting client-side, or ensuring the correct index exists.
    const result = await db.select().from(coursesTable)
    .innerJoin(enrollmentsTable, eq(coursesTable.cid, enrollmentsTable.cid))
    .where(eq(enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress))
    .orderBy(desc(enrollmentsTable.id));

    return NextResponse.json(result);
      }
}

export async function PUT(request) {
    const {completedChapters, courseId} = await request.json();
    const user = await currentUser();

    const result = await db.update(enrollmentsTable)
    .set({
        completedChapters: completedChapters
    }).where(and(
        eq(enrollmentsTable.cid, courseId),
        eq(enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress)
    )).returning(enrollmentsTable);

    return NextResponse.json(result);
}

// DELETE route for unenrollment
export async function DELETE(request) {
    const { courseId } = await request.json();
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress.emailAddress;

    try {
        const deletedEnrollment = await db.delete(enrollmentsTable)
            .where(and(
                eq(enrollmentsTable.cid, courseId),
                eq(enrollmentsTable.userEmail, userEmail)
            ))
            .returning(); // Returns the deleted rows (or specific columns if specified)

        if (deletedEnrollment.length === 0) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deletedCount: deletedEnrollment.length });
    } catch (error) {
        console.error("Enrollment DELETE API Error:", error);
        return NextResponse.json(
            { error: 'Failed to unenroll from course due to a server error.' },
            { status: 500 }
        );
    }
}
