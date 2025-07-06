import { t } from "@lingui/macro";
import { List, SquaresFour } from "@phosphor-icons/react";
import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

import { GridView } from "./_layouts/grid";
import { ListView } from "./_layouts/list";

type Layout = "grid" | "list";
type DocumentType = "RESUME" | "COVER_LETTER" | "RESIGNATION_LETTER" | "WEBSITE";

export const DocumentsPage = () => {
  const [layout, setLayout] = useState<Layout>("grid");
  const [activeTab, setActiveTab] = useState<DocumentType>("RESUME");

  return (
    <>
      <Helmet>
        <title>
          {t`My Documents`} - {t`GFAZE Resume`}
        </title>
      </Helmet>

      <div className="space-y-4">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          {t`My Documents`}
        </motion.h1>

        <Tabs
          value={activeTab}
          className="space-y-4"
          onValueChange={(value) => {
            setActiveTab(value as DocumentType);
          }}
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="RESUME" className="text-xs sm:text-sm">
                {t`Resumes`}
              </TabsTrigger>
              <TabsTrigger value="COVER_LETTER" className="text-xs sm:text-sm">
                {t`Cover Letters`}
              </TabsTrigger>
              <TabsTrigger value="RESIGNATION_LETTER" className="text-xs sm:text-sm">
                {t`Resignation Letters`}
              </TabsTrigger>
              <TabsTrigger value="WEBSITE" className="text-xs sm:text-sm">
                {t`Websites`}
              </TabsTrigger>
            </TabsList>

            <Tabs
              value={layout}
              onValueChange={(value) => {
                setLayout(value as Layout);
              }}
            >
              <TabsList>
                <TabsTrigger value="grid" className="size-8 p-0 sm:h-8 sm:w-auto sm:px-4">
                  <SquaresFour />
                  <span className="ml-2 hidden sm:block">{t`Grid`}</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="size-8 p-0 sm:h-8 sm:w-auto sm:px-4">
                  <List />
                  <span className="ml-2 hidden sm:block">{t`List`}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea
            allowOverflow
            className="h-[calc(100vh-180px)] overflow-visible lg:h-[calc(100vh-128px)]"
          >
            <TabsContent value="RESUME">
              {layout === "grid" ? <GridView type="RESUME" /> : <ListView type="RESUME" />}
            </TabsContent>
            <TabsContent value="COVER_LETTER">
              {layout === "grid" ? (
                <GridView type="COVER_LETTER" />
              ) : (
                <ListView type="COVER_LETTER" />
              )}
            </TabsContent>
            <TabsContent value="RESIGNATION_LETTER">
              {layout === "grid" ? (
                <GridView type="RESIGNATION_LETTER" />
              ) : (
                <ListView type="RESIGNATION_LETTER" />
              )}
            </TabsContent>
            <TabsContent value="WEBSITE">
              {layout === "grid" ? <GridView type="WEBSITE" /> : <ListView type="WEBSITE" />}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </>
  );
};
