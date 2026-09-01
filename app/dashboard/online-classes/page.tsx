import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Video, Calendar, Clock, User, ExternalLink, ShieldCheck, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function UserOnlineClassesPage() {
  const { userId } = await auth()

  let user = null
  if (userId) {
    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        onlineEnrolments: {
          include: {
            onlineClass: true,
          },
        },
      },
    })
  }

  // Fetch all active published online classes
  const activeClasses = await (prisma as any).onlineClass.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-primary text-on-primary rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <span className="text-tertiary-fixed font-semibold text-xs uppercase tracking-widest block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-tertiary-fixed" />
            Live Stream Sanctuary Portal
          </span>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold">Online Classes &amp; Live Streams</h1>
          <p className="text-xs text-on-primary-container leading-relaxed">
            Join classical ashram practices directly from your home with certified yoga masters in Rishikesh.
          </p>
        </div>
        <Link
          href="/online-classes"
          className="bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-primary font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          <span>Browse All Classes</span>
        </Link>
      </div>

      {/* Enrolled Active Passes */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          My Sanctuary Pass &amp; Enrolments
        </h2>

        {(!user?.onlineEnrolments || user.onlineEnrolments.length === 0) ? (
          <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto font-bold">
              🧘
            </div>
            <h3 className="text-sm font-bold text-primary">No Active Online Enrolments</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              You are currently on guest access. Explore our live stream schedule below to join Rishikesh masters live on Zoom / Meet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.onlineEnrolments.map((enrolment: any) => (
              <div
                key={enrolment.id}
                className="bg-surface rounded-2xl p-5 border border-secondary/30 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {enrolment.status}
                    </span>
                    <h3 className="font-bold text-primary text-base mt-1">
                      {enrolment.onlineClass.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-secondary">
                    ${enrolment.onlineClass.price} USD
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {enrolment.onlineClass.description}
                </p>
                {enrolment.onlineClass.meetingUrl ? (
                  <a
                    href={enrolment.onlineClass.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#1C2E26] hover:bg-black text-[#E2C799] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <Video className="w-4 h-4 text-[#E2C799]" />
                    <span>Join Live Stream Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Meeting link will be shared 15 mins before start time.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Stream Schedule */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <Calendar className="w-5 h-5 text-secondary" />
          Live Stream Daily Schedule
        </h2>

        <div className="bg-surface rounded-2xl border border-outline-variant/30 divide-y divide-outline-variant/20 shadow-xs overflow-hidden">
          {activeClasses.length === 0 ? (
            <div className="p-8 text-center text-xs text-on-surface-variant">
              No live classes scheduled for today. Please check back soon.
            </div>
          ) : (
            activeClasses.map((cls: any) => (
              <div
                key={cls.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-primary text-base">{cls.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {cls.level}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{cls.description}</p>
                  <div className="flex items-center gap-4 text-xs font-medium text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {cls.timeSlot}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {cls.instructor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/online-classes`}
                    className="px-4 py-2.5 border border-primary text-primary hover:bg-primary hover:text-on-primary font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Inquire Pass</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
