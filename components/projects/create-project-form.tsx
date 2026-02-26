"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useMemo, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"
import { createProject } from "@/lib/api/projects"

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  startDate: z.string().optional(),
  externalId: z
    .number({ error: "External place ID is required" })
    .int("External place ID must be an integer")
    .positive("External place ID must be greater than 0"),
})

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

const defaultValues: CreateProjectFormValues = {
  name: "",
  description: "",
  startDate: "",
  externalId: 0,
}

export function CreateProjectForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues,
  })

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      setFormError(null)
      form.reset(defaultValues)
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
          external_id: values.externalId,
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
        <CardDescription>
          Create a project and include one place external ID from the Art Institute API.
        </CardDescription>
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

            <Field data-invalid={!!form.formState.errors.externalId}>
              <FieldLabel htmlFor="project-first-place-id">First place external ID</FieldLabel>
              <Input
                id="project-first-place-id"
                inputMode="numeric"
                placeholder="e.g. 129884"
                type="number"
                {...form.register("externalId", {
                  valueAsNumber: true,
                })}
              />
              <FieldDescription>
                Backend currently requires at least one place while creating a project.
              </FieldDescription>
              <FieldError errors={[form.formState.errors.externalId]} />
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
