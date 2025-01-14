"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  id: z.string().min(2).max(50),
  name: z.string().min(2).max(50),
  type: z.string().min(2).max(50),
  url: z.union([z.string().url(), z.string().length(0)]).optional(),
  tags: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

const ComposeTemplate = (data: FormSchema) => {
  return `services:
  ${data.id}:
    image: ${data.type}
    container_name: ${data.name}
    labels:
      - "ca.wyattjoh.watchy.enable=true"
      - "ca.wyattjoh.watchy.service.${data.id}.name=${data.name}"
      - "ca.wyattjoh.watchy.service.${data.id}.type=${data.type}"
      - "ca.wyattjoh.watchy.service.${data.id}.url=${data.url ?? ""}"
      - "ca.wyattjoh.watchy.service.${data.id}.tags=${data.tags ?? ""}"`;
};

const RunTemplate = (data: FormSchema) => {
  return `docker run -d --name ${data.name} \\
    --label "ca.wyattjoh.watchy.enable=true" \\
    --label "ca.wyattjoh.watchy.service.${data.id}.name=${data.name}" \\
    --label "ca.wyattjoh.watchy.service.${data.id}.type=${data.type}" \\
    --label "ca.wyattjoh.watchy.service.${data.id}.url=${data.url ?? ""}" \\
    --label "ca.wyattjoh.watchy.service.${data.id}.tags=${data.tags ?? ""}" \\
    ${data.type}`;
};

export function ConfigureContainerButton() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      type: "",
      url: "",
      tags: "",
    },
  });
  const [data, setData] = useState<FormSchema | null>(null);

  function onSubmit(values: FormSchema) {
    setData(values);
  }

  function onOpenChange(open: boolean) {
    if (open) {
      setData(null);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="h-4 w-4" /> Configure Container
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure Container Labels</DialogTitle>
          <DialogDescription>
            This wizard will help create the labels for your container so it can
            be discovered by Watchly.
          </DialogDescription>
        </DialogHeader>
        {data ? (
          <div className="space-y-4">
            <Tabs defaultValue="account">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="account">Docker Compose</TabsTrigger>
                <TabsTrigger value="password">Docker Run</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <div className="relative">
                  <Button
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      void navigator.clipboard.writeText(ComposeTemplate(data));
                    }}
                  >
                    Copy
                  </Button>
                  <pre className="text-sm text-muted-foreground bg-foreground/10 p-4 rounded-md overflow-x-scroll w-full">
                    {ComposeTemplate(data)}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="password">
                <div className="relative">
                  <Button
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      void navigator.clipboard.writeText(RunTemplate(data));
                    }}
                  >
                    Copy
                  </Button>
                  <pre className="text-sm text-muted-foreground bg-foreground/10 p-4 rounded-md overflow-x-scroll w-full">
                    {RunTemplate(data)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setData(null);
                }}
              >
                Back
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID</FormLabel>
                    <FormControl>
                      <Input placeholder="plex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Plex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder="plex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="http://localhost:32400" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" variant="secondary">
                  Generate Labels
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
