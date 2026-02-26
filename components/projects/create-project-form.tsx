"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { searchArtworks, type ArtworkSearchResult } from "@/lib/api/artworks"
import { ApiError } from "@/lib/api/errors"
import { createProject } from "@/lib/api/projects"

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  startDate: z.string().optional(),
  artworkId: z
    .number({ error: "Please select a place from search results" })
    .int("Place selection is invalid")
    .positive("Please select a place from search results"),
})

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

const defaultValues: CreateProjectFormValues = {
  name: "",
  description: "",
  startDate: "",
  artworkId: 0,
}

function getArtworkLabel(artwork: ArtworkSearchResult): string {
  if (artwork.artist_title) {
    return `${artwork.title ?? "Untitled"} - ${artwork.artist_title}`
  }

  return artwork.title ?? `Artwork #${artwork.id}`
}

export function CreateProjectForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkSearchResult | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
    }, 350)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [searchQuery])

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues,
  })

  const artworksQuery = useQuery({
    queryKey: ["artwork-search", debouncedSearchQuery],
    queryFn: () => searchArtworks(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length >= 2,
  })

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      setFormError(null)
      form.reset(defaultValues)
      setSearchQuery("")
      setDebouncedSearchQuery("")
      setSelectedArtwork(null)
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message)
        return
      }

      setFormError("Unable to create project")
    },
  })

  const isSubmitting = form.formState.isSubmitting || createProjectMutation.isPending

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return "Creating..."
    }

    return "Create project"
  }, [isSubmitting])

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    await createProjectMutation.mutateAsync({
      name: values.name,
      description: values.description?.trim() ? values.description.trim() : null,
      start_date: values.startDate || null,
      places: [
        {
          external_id: values.artworkId,
        },
      ],
    })
  })

  const startDateController = useController({
    control: form.control,
    name: "startDate",
  })

  const selectedStartDate = startDateController.field.value
  const selectedDate = selectedStartDate ? new Date(`${selectedStartDate}T00:00:00`) : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add new travel project</CardTitle>
        <CardDescription>Create a project and pick at least one place from Art Institute results.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="project-name">Name</FieldLabel>
              <Input id="project-name" placeholder="Summer in Chicago" {...form.register("name")} />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="project-description">Description</FieldLabel>
              <Textarea
                id="project-description"
                placeholder="Optional notes about this trip"
                rows={4}
                {...form.register("description")}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.startDate}>
              <FieldLabel htmlFor="project-start-date">Start date</FieldLabel>
              <Popover>
                <PopoverTrigger render={<Button variant="outline" />} id="project-start-date">
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      startDateController.field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={[form.formState.errors.startDate]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.artworkId}>
              <FieldLabel htmlFor="artwork-search">First place</FieldLabel>
              <Input
                id="artwork-search"
                placeholder="Search artworks (e.g. Picasso, Chicago)"
                value={searchQuery}
                onChange={(event) => {
                  if (selectedArtwork) {
                    setSelectedArtwork(null)
                    form.setValue("artworkId", 0)
                  }

                  setSearchQuery(event.target.value)
                }}
              />
              <FieldDescription>
                Search by keyword, then select one result to attach as the first place.
              </FieldDescription>

              {selectedArtwork ? (
                <div className="bg-muted/40 flex items-center justify-between rounded-lg border p-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{getArtworkLabel(selectedArtwork)}</p>
                    <p className="text-muted-foreground text-xs">External ID: {selectedArtwork.id}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedArtwork(null)
                      form.setValue("artworkId", 0)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              ) : null}

              {artworksQuery.isLoading ? (
                <p className="text-muted-foreground text-sm">Searching artworks...</p>
              ) : null}

              {artworksQuery.isError ? (
                <p className="text-destructive text-sm">Unable to load search results right now.</p>
              ) : null}

              {artworksQuery.data && artworksQuery.data.length > 0 && !selectedArtwork ? (
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border p-2">
                  {artworksQuery.data.map((artwork) => (
                    <button
                      key={artwork.id}
                      type="button"
                      className="hover:bg-muted/60 flex w-full items-center justify-between rounded-md border p-2 text-left"
                      onClick={() => {
                        form.setValue("artworkId", artwork.id, { shouldValidate: true })
                        setSelectedArtwork(artwork)
                        setSearchQuery(getArtworkLabel(artwork))
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{artwork.title ?? "Untitled"}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {artwork.artist_title ?? "Unknown artist"}
                        </p>
                      </div>
                      <Badge variant="outline">#{artwork.id}</Badge>
                    </button>
                  ))}
                </div>
              ) : null}

              {debouncedSearchQuery.length >= 2 &&
              artworksQuery.data &&
              artworksQuery.data.length === 0 &&
              !selectedArtwork ? (
                <p className="text-muted-foreground text-sm">No artworks found for this query.</p>
              ) : null}

              <FieldError errors={[form.formState.errors.artworkId]} />
            </Field>
          </FieldGroup>

          {formError ? <FieldError>{formError}</FieldError> : null}

          <Button disabled={isSubmitting} type="submit">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
