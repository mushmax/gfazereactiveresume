import type { DocumentDto } from "@reactive-resume/dto";
import { sortByDate } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";

import { useDocuments } from "../../../../../services/document";
import { BaseListItem } from "./_components/base-item";
import { CreateDocumentListItem } from "./_components/create-item";
import { DocumentListItem } from "./_components/document-item";
import { ImportDocumentListItem } from "./_components/import-item";

type ListViewProps = {
  type: "RESUME" | "COVER_LETTER" | "RESIGNATION_LETTER" | "WEBSITE";
};

export const ListView = ({ type }: ListViewProps) => {
  const { documents, loading } = useDocuments(type);

  return (
    <div className="grid gap-y-2">
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
        <CreateDocumentListItem type={type} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
      >
        <ImportDocumentListItem type={type} />
      </motion.div>

      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="duration-300 animate-in fade-in"
            style={{ animationFillMode: "backwards", animationDelay: `${i * 300}ms` }}
          >
            <BaseListItem />
          </div>
        ))}

      {documents && (
        <AnimatePresence>
          {documents
            .sort((a: DocumentDto, b: DocumentDto) => sortByDate(a, b, "updatedAt"))
            .map((document, index: number) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0, transition: { delay: (index + 2) * 0.1 } }}
                exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
              >
                <DocumentListItem document={document} />
              </motion.div>
            ))}
        </AnimatePresence>
      )}
    </div>
  );
};
