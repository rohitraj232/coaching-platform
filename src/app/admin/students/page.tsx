
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import StudentStatusButton from "@/components/admin/StudentStatusButton";
import BulkDeleteStudents from "@/components/admin/BulkDeleteStudents";
import {
  FiUsers,
  FiSearch,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiDownload,
} from "react-icons/fi";

interface StudentsPageProps {
  searchParams: Promise<{
    q?: string;
    classLevel?: string;
    page?: string;
    limit?: string;
  }>;
}

const classLevels = Array.from({ length: 12 }, (_, index) =>
  String(index + 1)
);

const validLimits = [10, 25, 50];

export default async function AdminStudentsPage({
  searchParams,
}: StudentsPageProps) {
  await requireAdmin();

  const supabase = createAdminClient();
  const params = await searchParams;

  const search = params.q?.trim() || "";
  const classLevel = params.classLevel || "";

  const requestedPage = Math.max(1, Number(params.page) || 1);
  const requestedLimit = Number(params.limit) || 10;

  const limit = validLimits.includes(requestedLimit)
    ? requestedLimit
    : 10;

  // Fetch students
  const { data: studentsData, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, class_level, created_at, is_active")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Students fetch error:", error);
    throw new Error("Unable to load students.");
  }

  const students = studentsData || [];

  // Total registered students
  const allStudentsCount = students.length;

  // Search students
  let filteredStudents = students;

  if (search) {
    const searchValue = search.toLowerCase();

    filteredStudents = filteredStudents.filter((student) => {
      return (
        student.full_name?.toLowerCase().includes(searchValue) ||
        student.phone?.toLowerCase().includes(searchValue) ||
        student.id.toLowerCase().includes(searchValue)
      );
    });
  }

  // Filter by class
  if (classLevels.includes(classLevel)) {
    filteredStudents = filteredStudents.filter(
      (student) => String(student.class_level) === classLevel
    );
  }

  // Filtered count
  const totalStudents = filteredStudents.length;

  // Class-wise counts
  const classCounts = classLevels.map((level) => ({
    level,
    count: students.filter(
      (student) => String(student.class_level) === level
    ).length,
  }));

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalStudents / limit));

  const currentPage = Math.min(requestedPage, totalPages);

  const startIndex = (currentPage - 1) * limit;

  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + limit
  );

  const from = totalStudents === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + limit, totalStudents);

  // Pagination URL
  function getPageUrl(page: number) {
    const query = new URLSearchParams();

    if (search) query.set("q", search);
    if (classLevel) query.set("classLevel", classLevel);

    query.set("page", String(page));
    query.set("limit", String(limit));

    return `/admin/students?${query.toString()}`;
  }

  // Export URL - preserve search and class filters
  const exportParams = new URLSearchParams();

  if (search) {
    exportParams.set("q", search);
  }

  if (classLevels.includes(classLevel)) {
    exportParams.set("classLevel", classLevel);
  }

  const exportUrl = `/api/admin/students/export${exportParams.toString()
    ? `?${exportParams.toString()}`
    : ""
    }`;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      {/* Page Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Student Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all registered students from Class 1 to Class 12.
          </p>

        </div>
        
        <BulkDeleteStudents />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          {/* Student Counts */}
          <div className="grid grid-cols-2 gap-3">

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100">
                <FiUsers className="text-xl text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Registered
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {allStudentsCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100">
                <FiUsers className="text-xl text-green-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Filtered Students
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {totalStudents}
                </p>
              </div>
            </div>

          </div>

          {/* Export Excel */}
          <Link
            href={exportUrl}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <FiDownload className="text-lg" />
            Export Excel
          </Link>

        </div>
      </div>

      {/* Class-wise Summary */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            Class-wise Students
          </h2>

          <span className="text-xs text-slate-400">
            Class 1 – Class 12
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {classCounts.map((item) => (
            <Link
              key={item.level}
              href={`/admin/students?classLevel=${item.level}`}
              className={`rounded-xl border p-4 transition hover:border-blue-300 hover:bg-blue-50 ${classLevel === item.level
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white"
                }`}
            >
              <p className="text-sm text-slate-500">
                Class {item.level}
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {item.count}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Students
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <form
        action="/admin/students"
        method="GET"
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">

          {/* Search */}
          <div className="relative md:col-span-6">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Search by name, phone or student ID..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Class Filter */}
          <div className="relative md:col-span-3">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <select
              name="classLevel"
              defaultValue={classLevel}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Classes</option>

              {classLevels.map((level) => (
                <option key={level} value={level}>
                  Class {level}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 md:col-span-3">

            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Apply Filters
            </button>

            <Link
              href="/admin/students"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </Link>

          </div>
        </div>
      </form>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        {/* Table Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="font-semibold text-slate-800">
              Registered Students
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {from}–{to} of {totalStudents} students
            </p>
          </div>

          {/* Rows Per Page */}
          <form
            action="/admin/students"
            method="GET"
            className="flex items-center gap-2"
          >
            {search && (
              <input type="hidden" name="q" value={search} />
            )}

            {classLevel && (
              <input
                type="hidden"
                name="classLevel"
                value={classLevel}
              />
            )}

            <input type="hidden" name="page" value="1" />

            <select
              name="limit"
              defaultValue={String(limit)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
            >
              {validLimits.map((value) => (
                <option key={value} value={value}>
                  {value} per page
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Apply
            </button>
          </form>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Student
                </th>

                <th className="px-5 py-4 font-semibold">
                  Phone
                </th>

                <th className="px-5 py-4 font-semibold">
                  Class
                </th>

                <th className="px-5 py-4 font-semibold">
                  Registered On
                </th>

                <th className="px-5 py-4 font-semibold">
                  Status
                </th>

                <th className="px-5 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {student.full_name
                            ?.charAt(0)
                            .toUpperCase() || "S"}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {student.full_name || "Unnamed Student"}
                          </p>

                          <p className="max-w-[180px] truncate text-xs text-slate-400">
                            {student.id}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-slate-600">
                      {student.phone || "—"}
                    </td>

                    {/* Class */}
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Class {student.class_level || "—"}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="px-5 py-4 text-slate-600">
                      {student.created_at
                        ? new Date(
                          student.created_at
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "—"}
                    </td>

                    {/* Student Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${student.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${student.is_active ? "bg-green-500" : "bg-red-500"
                            }`}
                        />
                        {student.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <FiEye />
                          View Details
                        </Link>

                        <StudentStatusButton
                          studentId={student.id}
                          studentName={student.full_name || "this student"}
                          isActive={student.is_active}
                        />
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <FiUsers className="mx-auto mb-3 text-3xl text-slate-300" />

                    <p className="font-medium text-slate-600">
                      No students found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or class filter.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">

            <Link
              href={getPageUrl(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage <= 1}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${currentPage <= 1
                ? "pointer-events-none border-slate-200 text-slate-300"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <FiChevronLeft />
              Previous
            </Link>

            <Link
              href={getPageUrl(
                Math.min(totalPages, currentPage + 1)
              )}
              aria-disabled={currentPage >= totalPages}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${currentPage >= totalPages
                ? "pointer-events-none border-slate-200 text-slate-300"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
            >
              Next
              <FiChevronRight />
            </Link>

          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Note: The listing currently loads up to 1,000 students.
        Excel export fetches records in batches and is not limited
        to the listing page size.
      </p>

    </div>
  );
}
