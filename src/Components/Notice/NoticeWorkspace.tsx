"use client";

import { Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { NoticeAudienceRole, NoticeService, type NoticeItem } from "@/services/Notice/notice.service";

const NOTICE_ROLE_OPTIONS: Array<{ value: NoticeAudienceRole; label: string }> = [
  { value: "ADMIN", label: "Admin" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "TEACHER", label: "Teacher" },
  { value: "STUDENT", label: "Student" },
];

type NoticeWorkspaceProps = {
  canCompose: boolean;
  isUniversity?: boolean;
  onUnreadCountChange?: (count: number) => void;
};

const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function NoticeWorkspace({
  canCompose,
  isUniversity = true,
  onUnreadCountChange,
}: Readonly<NoticeWorkspaceProps>) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 700);

  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createTargetRoles, setCreateTargetRoles] = useState<NoticeAudienceRole[]>(["TEACHER", "STUDENT"]);
  const [creatingNotice, setCreatingNotice] = useState(false);

  const [editingNoticeId, setEditingNoticeId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [editingTargetRoles, setEditingTargetRoles] = useState<NoticeAudienceRole[]>([]);
  const [updatingNoticeId, setUpdatingNoticeId] = useState("");
  const [deletingNoticeId, setDeletingNoticeId] = useState("");

  const availableRoleOptions = useMemo(() => {
    if (isUniversity) {
      return NOTICE_ROLE_OPTIONS;
    }

    return NOTICE_ROLE_OPTIONS.filter(
      (option) => option.value !== "FACULTY" && option.value !== "DEPARTMENT",
    );
  }, [isUniversity]);

  const availableRoleValues = useMemo(
    () => new Set(availableRoleOptions.map((option) => option.value)),
    [availableRoleOptions],
  );

  useEffect(() => {
    setCreateTargetRoles((prev) => prev.filter((role) => availableRoleValues.has(role)));
  }, [availableRoleValues]);

  useEffect(() => {
    setEditingTargetRoles((prev) => prev.filter((role) => availableRoleValues.has(role)));
  }, [availableRoleValues]);

  const loadUnreadCount = useCallback(async () => {
    if (!onUnreadCountChange) {
      return;
    }

    try {
      const result = await NoticeService.getUnreadCount();
      onUnreadCountChange(result.unreadCount);
    } catch {
      // Keep sidebar badge unchanged if count fetch fails.
    }
  }, [onUnreadCountChange]);

  const loadNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const data = await NoticeService.listNotices(debouncedSearch || undefined);
      setNotices(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load notices";
      toast.error(message);
      setNotices([]);
    } finally {
      setLoadingNotices(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await NoticeService.markAllAsRead();
      } catch {
        // Keep page usable even if mark-as-read fails.
      }

      if (cancelled) {
        return;
      }

      await Promise.all([loadNotices(), loadUnreadCount()]);
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadNotices, loadUnreadCount]);

  useEffect(() => {
    void loadNotices();
  }, [debouncedSearch, loadNotices]);

  const canCreateNotice =
    createTitle.trim().length >= 2 &&
    createContent.trim().length >= 2 &&
    createTargetRoles.length > 0;

  const canSaveEditedNotice =
    editingTitle.trim().length >= 2 &&
    editingContent.trim().length >= 2 &&
    editingTargetRoles.length > 0;

  const toggleRole = (
    role: NoticeAudienceRole,
    selectedRoles: NoticeAudienceRole[],
    setter: (roles: NoticeAudienceRole[]) => void,
  ) => {
    if (selectedRoles.includes(role)) {
      setter(selectedRoles.filter((item) => item !== role));
      return;
    }

    setter([...selectedRoles, role]);
  };

  const roleLabelMap = useMemo(() => {
    return NOTICE_ROLE_OPTIONS.reduce<Record<string, string>>((acc, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {});
  }, []);

  const startEditing = (notice: NoticeItem) => {
    setEditingNoticeId(notice.id);
    setEditingTitle(notice.title);
    setEditingContent(notice.content);
    setEditingTargetRoles(notice.targetRoles);
  };

  const cancelEditing = () => {
    setEditingNoticeId("");
    setEditingTitle("");
    setEditingContent("");
    setEditingTargetRoles([]);
  };

  const handleCreateNotice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateNotice) {
      toast.warning("Provide title, content, and at least one recipient role");
      return;
    }

    setCreatingNotice(true);
    try {
      await NoticeService.createNotice({
        title: createTitle.trim(),
        content: createContent.trim(),
        targetRoles: createTargetRoles,
      });

      setCreateTitle("");
      setCreateContent("");
      setCreateTargetRoles(["TEACHER", "STUDENT"]);
      await Promise.all([loadNotices(), loadUnreadCount()]);
      toast.success("Notice sent successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send notice";
      toast.error(message);
    } finally {
      setCreatingNotice(false);
    }
  };

  const handleUpdateNotice = async (noticeId: string) => {
    if (!canSaveEditedNotice) {
      toast.warning("Provide title, content, and at least one recipient role");
      return;
    }

    setUpdatingNoticeId(noticeId);
    try {
      await NoticeService.updateNotice(noticeId, {
        title: editingTitle.trim(),
        content: editingContent.trim(),
        targetRoles: editingTargetRoles,
      });

      cancelEditing();
      await Promise.all([loadNotices(), loadUnreadCount()]);
      toast.success("Notice updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update notice";
      toast.error(message);
    } finally {
      setUpdatingNoticeId("");
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    setDeletingNoticeId(noticeId);
    try {
      await NoticeService.deleteNotice(noticeId);
      if (editingNoticeId === noticeId) {
        cancelEditing();
      }
      await Promise.all([loadNotices(), loadUnreadCount()]);
      toast.success("Notice deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete notice";
      toast.error(message);
    } finally {
      setDeletingNoticeId("");
    }
  };

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold sm:text-lg">Notices</h2>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notices"
            className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </article>

      {canCompose ? (
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold">Send Notice</h3>
          <form className="mt-4 space-y-3" onSubmit={handleCreateNotice}>
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Title</span>
              <input
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
                placeholder="Notice title"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Content</span>
              <textarea
                value={createContent}
                onChange={(event) => setCreateContent(event.target.value)}
                rows={4}
                placeholder="Write your notice content"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>

            <div className="space-y-2 text-sm">
              <p className="font-medium">Send To</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {availableRoleOptions.map((option) => (
                  <label
                    key={`create-${option.value}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={createTargetRoles.includes(option.value)}
                      onChange={() => toggleRole(option.value, createTargetRoles, setCreateTargetRoles)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingNotice || !canCreateNotice}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingNotice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Send Notice
            </button>
          </form>
        </article>
      ) : null}

      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        {loadingNotices ? (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notices...
          </div>
        ) : notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices found.</p>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => {
              const isEditing = editingNoticeId === notice.id;

              return (
                <article key={notice.id} className="rounded-xl border border-border/70 bg-background/60 p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />

                      <textarea
                        value={editingContent}
                        onChange={(event) => setEditingContent(event.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {availableRoleOptions.map((option) => (
                          <label
                            key={`edit-${notice.id}-${option.value}`}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={editingTargetRoles.includes(option.value)}
                              onChange={() =>
                                toggleRole(option.value, editingTargetRoles, setEditingTargetRoles)
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleUpdateNotice(notice.id)}
                          disabled={updatingNoticeId === notice.id || !canSaveEditedNotice}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingNoticeId === notice.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{notice.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            By {notice.sender.name} ({roleLabelMap[notice.senderRole] ?? notice.senderRole})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(notice.createdAt)}
                          </p>
                        </div>

                        {notice.canEdit ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(notice)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteNotice(notice.id)}
                              disabled={deletingNoticeId === notice.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingNoticeId === notice.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {notice.targetRoles.map((role) => (
                          <span
                            key={`${notice.id}-${role}`}
                            className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                          >
                            {roleLabelMap[role] ?? role}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </article>
    </div>
  );
}
