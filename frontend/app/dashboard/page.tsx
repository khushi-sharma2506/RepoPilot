"use client";

import { useEffect, useState } from "react";
import { getProjects, deleteProject } from "@/lib/pilot-api";
import { NavActions } from "@/components/shared/nav-actions";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Play, Calendar, FolderGit, ExternalLink, Loader2, Plus, Sparkles, Trash2, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    getProjects()
      .then((data) => {
        setProjects(data.projects || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [authStatus]);

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
      setProjectToDelete(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      alert("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <Image src="/logo.png" alt="RepoPilot Logo" width={32} height={32} priority className="rounded-full object-cover" />
          <span className="text-lg font-bold text-neutral-900 dark:text-white">
            Repo<span className="text-blue-500">Pilot</span> <span className="text-neutral-500 dark:text-neutral-400 font-normal">Dashboard</span>
          </span>
        </Link>
        <NavActions />
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">My Projects</h1>
            <p className="text-neutral-600 dark:text-neutral-400">View and manage all your generated repository videos.</p>
          </div>
          <Link href="/studio" className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm">
            <Plus size={18} /> New Video
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-neutral-400" size={32} />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-blue-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">No projects yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-8">
              You haven't generated any videos yet. Head over to the Studio to analyze your first GitHub repository!
            </p>
            <Link href="/studio" className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
              <Play size={18} fill="currentColor" /> Enter Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              // Extract details safely
              const projectName = project.repo_analysis_json?.manifest?.project_name || project.github_url.split('/').pop() || "Unknown Project";
              const tagLine = project.repo_analysis_json?.manifest?.one_line_description || project.github_url || "Repository Analysis";
              const date = new Date(project.created_at.endsWith("Z") ? project.created_at : project.created_at + "Z");
              const sceneCount = project.script_json?.scenes?.length || 0;
              
              // Figure out where they left off based on status
              const statusColor = project.status === "complete" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                                project.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" :
                                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
              const statusText = project.status === "complete" ? "Complete" : project.status === "failed" ? "Failed" : "In Progress";

              return (
                <Link 
                  key={project.id} 
                  href={`/studio?projectId=${project.id}`}
                  className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                      <FolderGit className="text-neutral-600 dark:text-neutral-400" size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${statusColor}`}>
                        {statusText}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setProjectToDelete(project.id);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {projectName}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-6 min-h-[40px]">
                    {tagLine}
                  </p>

                  <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDistanceToNow(date, { addSuffix: true })}
                    </div>
                    {sceneCount > 0 && (
                      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                        <Play size={12} fill="currentColor" /> {sceneCount} scenes
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {projectToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Delete Project</h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Are you sure you want to delete this project? This action cannot be undone and you will lose all generated scripts and audio.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[200] bg-emerald-600 dark:bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/50"
          >
            <CheckCircle2 size={20} className="text-emerald-100" />
            <span className="font-semibold text-sm">Project deleted successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
