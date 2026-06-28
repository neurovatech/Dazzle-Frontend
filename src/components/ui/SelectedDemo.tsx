"use client";

import GlobalSelect from "./Select";
import { Globe, Tag, User } from "lucide-react";

const countries = [
  { value: "", label: "Select a country" },
  { value: "de", label: "Germany" },
  { value: "us", label: "United States" },
  { value: "jp", label: "Japan" },
  { value: "fr", label: "France" },
];

const groupedOptions = [
  {
    label: "Europe",
    options: [
      { value: "de", label: "Germany" },
      { value: "fr", label: "France" },
      { value: "it", label: "Italy" },
    ],
  },
  {
    label: "Americas",
    options: [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
      { value: "br", label: "Brazil" },
    ],
  },
];

export default function GlobalSelectDemo() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-12">

        <header>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            GlobalSelect
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Reusable select input — Next.js + TypeScript + Tailwind CSS
          </p>
        </header>

        {/* ── Sizes ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            Sizes
          </h2>
          <GlobalSelect label="Small" size="sm" options={countries} />
          <GlobalSelect label="Medium (default)" size="md" options={countries} />
          <GlobalSelect label="Large" size="lg" options={countries} />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* ── Variants ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            Variants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlobalSelect label="Default" options={countries} />
            <GlobalSelect label="Ghost" variant="ghost" options={countries} />
            <GlobalSelect label="Pill" variant="pill" options={countries} />
            <GlobalSelect
              label="With prefix icon"
              prefixIcon={<Globe className="w-4 h-4" />}
              options={[
                { value: "en", label: "English" },
                { value: "de", label: "Deutsch" },
                { value: "ja", label: "日本語" },
              ]}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* ── States ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            States
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlobalSelect
              label="Error"
              state="error"
              hint="Please select a valid option"
              options={[{ value: "", label: "Select a country" }, ...countries.slice(1)]}
            />
            <GlobalSelect
              label="Success"
              state="success"
              hint="Looks good!"
              options={countries}
              defaultValue="de"
            />
            <GlobalSelect
              label="Disabled"
              disabled
              hint="This field is locked"
              options={[{ value: "", label: "Not available" }]}
            />
            <GlobalSelect
              label="With hint"
              hint="Affects your billing cycle"
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "annually", label: "Annually" },
              ]}
            />
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* ── Grouped options ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            Grouped options
          </h2>
          <GlobalSelect
            label="Region"
            prefixIcon={<Tag className="w-4 h-4" />}
            groups={groupedOptions}
          />
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* ── Inline / not full-width ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            Inline (not full-width)
          </h2>
          <div className="flex items-end gap-3 flex-wrap">
            <GlobalSelect
              label="Role"
              fullWidth={false}
              prefixIcon={<User className="w-4 h-4" />}
              options={[
                { value: "admin", label: "Admin" },
                { value: "editor", label: "Editor" },
                { value: "viewer", label: "Viewer" },
              ]}
            />
            <GlobalSelect
              fullWidth={false}
              variant="ghost"
              options={[
                { value: "asc", label: "A → Z" },
                { value: "desc", label: "Z → A" },
              ]}
            />
            <GlobalSelect
              fullWidth={false}
              variant="pill"
              size="sm"
              options={[
                { value: "all", label: "All time" },
                { value: "week", label: "This week" },
                { value: "month", label: "This month" },
              ]}
            />
          </div>
        </section>

      </div>
    </main>
  );
}