import type { DocumentDto } from "@reactive-resume/dto";
import { sortByDate } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";

import { useDocuments } from "../../../../../services/document";
import { BaseCard } from "./_components/base-card";
import { CreateDocumentCard } from "./_components/create-card";
import { DocumentCard } from "./_components/document-card";
import { ImportDocumentCard } from "./_components/import-card";

type GridViewProps = {
  type: "RESUME" | "COVER_LETTER" | "RESIGNATION_LETTER" | "WEBSITE";
};

export const GridView = ({ type }: GridViewProps) => {
  const { documents, loading } = useDocuments(type);

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
        <CreateDocumentCard type={type} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
      >
        <ImportDocumentCard type={type} />
      </motion.div>

      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="duration-300 animate-in fade-in"
            style={{ animationFillMode: "backwards", animationDelay: `${i * 300}ms` }}
          >
            <BaseCard />
          </div>
        ))}

      {documents && (
        <AnimatePresence>
          {documents
            .sort((a: DocumentDto, b: DocumentDto) => sortByDate(a, b, "updatedAt"))
            .map((document, index: number) => (
              <motion.div
                key={document.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0, transition: { delay: (index + 2) * 0.1 } }}
                exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
              >
                <DocumentCard document={document} />
              </motion.div>
            ))}
        </AnimatePresence>
      )}
    </div>
  );
};
