import { Megaphone } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { Announcement } from "../../../types/dashboard";
import { formatDate } from "../../../utils/date";
import { dummyAnnouncements } from "../data/dummyData";

type AnnouncementsProps = {
  announcements: Announcement[];
  isLoading?: boolean;
  isError?: boolean;
};

export const Announcements = ({ announcements, isLoading = false, isError = false }: AnnouncementsProps) => {
  const displayAnnouncements = isError || announcements.length === 0 ? dummyAnnouncements : announcements;

  return (
    <section aria-labelledby="announcements">
      <SectionHeader
        id="announcements"
        title="Pengumuman Desa"
        icon={<Megaphone size={22} />}
        action={<Button variant="ghost">Lihat semua</Button>}
      />
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="announcement-list">
          {displayAnnouncements.slice(0, 3).map((announcement) => (
            <article
              className={`announcement-item announcement-item--${announcement.priority.toLowerCase()}`}
              key={announcement.id}
            >
              <time>{formatDate(announcement.publishedAt)}</time>
              <div>
                <h3>{announcement.title}</h3>
                {announcement.content && <p>{announcement.content}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
