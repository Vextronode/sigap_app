import { Megaphone } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { Announcement } from "../../../types/dashboard";
import { formatDate } from "../../../utils/date";

type AnnouncementsProps = {
  announcements: Announcement[];
  isLoading?: boolean;
  isError?: boolean;
};

export const Announcements = ({ announcements, isLoading = false, isError = false }: AnnouncementsProps) => (
  <section aria-labelledby="announcements">
    <SectionHeader
      id="announcements"
      title="Pengumuman Desa"
      icon={<Megaphone size={22} />}
      action={<Button variant="ghost">Lihat semua</Button>}
    />
    {isLoading ? (
      <CardSkeleton />
    ) : isError ? (
      <StateMessage
        type="error"
        title="Pengumuman gagal dimuat"
        message="Pengumuman desa belum dapat diambil dari API."
      />
    ) : announcements.length > 0 ? (
      <div className="announcement-list">
        {announcements.slice(0, 3).map((announcement) => (
          <article className={`announcement-item announcement-item--${announcement.priority.toLowerCase()}`} key={announcement.id}>
            <time>{formatDate(announcement.publishedAt)}</time>
            <div>
              <h3>{announcement.title}</h3>
              {announcement.content && <p>{announcement.content}</p>}
            </div>
          </article>
        ))}
      </div>
    ) : (
      <StateMessage title="Belum ada pengumuman" message="Pengumuman aktif dari pemerintah desa akan tampil di sini." />
    )}
  </section>
);
