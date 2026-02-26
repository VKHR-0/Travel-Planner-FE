"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useController, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
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
  places: z
    .array(
      z.object({
        externalId: z.number().int().positive(),
        title: z.string(),
        artistTitle: z.string().nullable(),
        notes: z.string().max(5000, "Notes are too long").optional(),
      }),
    )
    .min(1, "Add at least one place")
    .max(10, "You can add up to 10 places")
    .refine(
      (places) => {
        const ids = places.map((place) => place.externalId)
        return new Set(ids).size === ids.length
      },
      { message: "Do not add the same place more than once" },
    ),
})

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

const defaultValues: CreateProjectFormValues = {
  name: "",
  description: "",
  startDate: "",
  places: [],
}

export function CreateProjectForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedArtworkOption, setSelectedArtworkOption] = useState<ArtworkSearchResult | null>(null)
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

  const placesFieldArray = useFieldArray({
    control: form.control,
    name: "places",
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
      setSelectedArtworkOption(null)
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Project created", {
        description: "Your travel project was saved successfully.",
      })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message)
        toast.error("Could not create project", {
          description: error.message,
        })
        return
      }

      setFormError("Unable to create project")
      toast.error("Could not create project", {
        description: "Unexpected error occurred. Please try again.",
      })
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
      places: values.places.map((place) => ({
        external_id: place.externalId,
        notes: place.notes?.trim() ? place.notes.trim() : null,
      })),
    })
  })

  const startDateController = useController({
    control: form.control,
    name: "startDate",
  })

  const selectedStartDate = startDateController.field.value
  const selectedDate = selectedStartDate ? new Date(`${selectedStartDate}T00:00:00`) : undefined

  const placesError = form.formState.errors.places
  const selectedPlacesCount = placesFieldArray.fields.length
  const hasReachedPlaceLimit = selectedPlacesCount >= 10

  const addArtwork = (artwork: ArtworkSearchResult) => {
    const alreadyAdded = placesFieldArray.fields.some(
      (field) => field.externalId === artwork.id,
    )

    if (alreadyAdded) {
      form.setError("places", { message: "This place is already selected" })
      return
    }

    if (placesFieldArray.fields.length >= 10) {
      form.setError("places", { message: "You can add up to 10 places" })
      return
    }

    form.clearErrors("places")
    placesFieldArray.append({
      externalId: artwork.id,
      title: artwork.title ?? `Artwork #${artwork.id}`,
      artistTitle: artwork.artist_title,
      notes: "",
    })
    setSelectedArtworkOption(null)
    setSearchQuery("")
    setDebouncedSearchQuery("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add new travel project</CardTitle>
        <CardDescription>Create a project and pick 1 to 10 places from Art Institute results.</CardDescription>
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
                <PopoverTrigger
                  render={<Button variant="outline" />}
                  id="project-start-date"
                  className="w-full justify-start text-left"
                >
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

            <Field data-invalid={!!placesError}>
              <FieldLabel htmlFor="artwork-search">Places</FieldLabel>
              <Combobox
                items={artworksQuery.data ?? []}
                value={selectedArtworkOption}
                inputValue={searchQuery}
                onInputValueChange={(value) => {
                  setSearchQuery(value)
                }}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }

                  addArtwork(value)
                }}
                itemToStringLabel={(item) => `${item.title ?? "Untitled"} ${item.artist_title ?? ""}`}
                itemToStringValue={(item) => `${item.id}`}
                isItemEqualToValue={(item, value) => item.id === value.id}
              >
                <ComboboxInput
                  id="artwork-search"
                  placeholder="Search artworks (e.g. Picasso, Chicago)"
                  showClear
                  disabled={hasReachedPlaceLimit}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    {debouncedSearchQuery.length < 2
                      ? "Type at least 2 characters"
                      : "No artworks found for this query."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.id} value={item}>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.title ?? "Untitled"}</p>
                          <p className="text-muted-foreground truncate text-xs">
                            {item.artist_title ?? "Unknown artist"}
                          </p>
                        </div>
                        <span className="text-muted-foreground ml-auto text-xs">#{item.id}</span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <FieldDescription>
                Search by keyword, then add places to your project list.
              </FieldDescription>

              <p className="text-muted-foreground text-xs">
                Selected places: {selectedPlacesCount}/10
              </p>

              {hasReachedPlaceLimit ? (
                <p className="text-muted-foreground text-sm">
                  Maximum reached. Remove a place to add another one.
                </p>
              ) : null}

              {artworksQuery.isLoading ? (
                <p className="text-muted-foreground text-sm">Searching artworks...</p>
              ) : null}

              {artworksQuery.isError ? (
                <p className="text-destructive text-sm">Unable to load search results right now.</p>
              ) : null}

              {placesFieldArray.fields.length > 0 ? (
                <div className="space-y-2 rounded-lg border p-2">
                  {placesFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="space-y-2 rounded-md border p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{field.title}</p>
                          <p className="text-muted-foreground truncate text-xs">
                            {field.artistTitle ?? "Unknown artist"} - ID {field.externalId}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            placesFieldArray.remove(index)
                            form.clearErrors("places")
                          }}
                        >
                          Remove
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Optional notes for this place"
                        rows={2}
                        {...form.register(`places.${index}.notes`)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <FieldError errors={[placesError]} />
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
