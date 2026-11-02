"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { defaultState, useAnandaStore, type AnandaConfig } from "@/lib/ananda-store"

export interface AnandaProject {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  config: AnandaConfig
}

interface ProjectsState {
  brandName: string
  projects: AnandaProject[]
  /** The project currently loaded into the configurator, or null while on My Projects. */
  activeProjectId: string | null
  setBrandName: (name: string) => void
  /** Creates an empty project, loads it into the configurator and returns its id. */
  createProject: () => string
  openProject: (id: string) => void
  renameProject: (id: string, name: string) => void
  duplicateProject: (id: string) => void
  deleteProject: (id: string) => void
  /** Writes the configurator's current values into the active project. */
  saveActive: () => void
  /** Saves the active project and returns to My Projects. */
  closeActive: () => void
  /** Wraps a configuration that was started before projects existed into a project. */
  adoptCurrent: () => void
}

const knownKeys = Object.keys(defaultState) as (keyof AnandaConfig)[]

function snapshotConfig(): AnandaConfig {
  const live = useAnandaStore.getState() as unknown as Record<string, unknown>
  return Object.fromEntries(knownKeys.map((key) => [key, live[key]])) as unknown as AnandaConfig
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.round(Math.random() * 1e6)}`
}

function nextProjectName(projects: AnandaProject[]) {
  const taken = new Set(projects.map((p) => p.name))
  let n = projects.length + 1
  while (taken.has(`Project ${n}`)) n += 1
  return `Project ${n}`
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      brandName: "",
      projects: [],
      activeProjectId: null,
      setBrandName: (brandName) => set({ brandName }),
      createProject: () => {
        const now = Date.now()
        const project: AnandaProject = {
          id: newId(),
          name: nextProjectName(get().projects),
          createdAt: now,
          updatedAt: now,
          config: { ...defaultState },
        }
        set((state) => ({ projects: [...state.projects, project], activeProjectId: project.id }))
        useAnandaStore.setState({ ...defaultState, hasStarted: true })
        return project.id
      },
      openProject: (id) => {
        const project = get().projects.find((p) => p.id === id)
        if (!project) return
        set({ activeProjectId: id })
        useAnandaStore.setState({ ...defaultState, ...project.config, hasStarted: true })
      },
      renameProject: (id, name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set((state) => ({ projects: state.projects.map((p) => (p.id === id ? { ...p, name: trimmed } : p)) }))
      },
      duplicateProject: (id) => {
        const source = get().projects.find((p) => p.id === id)
        if (!source) return
        const now = Date.now()
        const copy: AnandaProject = {
          ...source,
          id: newId(),
          name: `${source.name} (copy)`,
          createdAt: now,
          updatedAt: now,
          config: structuredClone(source.config),
        }
        set((state) => {
          const index = state.projects.findIndex((p) => p.id === id)
          const projects = [...state.projects]
          projects.splice(index + 1, 0, copy)
          return { projects }
        })
      },
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
      })),
      saveActive: () => {
        const { activeProjectId } = get()
        if (!activeProjectId) return
        const config = snapshotConfig()
        set((state) => ({
          projects: state.projects.map((p) => (p.id === activeProjectId ? { ...p, config, updatedAt: Date.now() } : p)),
        }))
      },
      closeActive: () => {
        get().saveActive()
        set({ activeProjectId: null })
        useAnandaStore.setState({ hasStarted: false })
      },
      adoptCurrent: () => {
        const now = Date.now()
        const project: AnandaProject = {
          id: newId(),
          name: nextProjectName(get().projects),
          createdAt: now,
          updatedAt: now,
          config: snapshotConfig(),
        }
        set((state) => ({ projects: [...state.projects, project], activeProjectId: project.id }))
      },
    }),
    {
      name: "ananda-projects-v1",
      version: 1,
      partialize: (state) => ({ brandName: state.brandName, projects: state.projects, activeProjectId: state.activeProjectId }),
    },
  ),
)
