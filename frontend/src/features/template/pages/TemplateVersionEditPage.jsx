import { useParams, useNavigate } from "react-router-dom";
import TemplateEditorLayout from "~/components/template/TemplateEditorLayout";
import { useTemplateVersionEdit } from "~/features/template/hooks/useTemplateVersionEdit";

export default function TemplateVersionEditPage() {
  const { type, version } = useParams();
  const navigate = useNavigate();

  const edit = useTemplateVersionEdit(type, Number(version));

  return (
    <TemplateEditorLayout
      mode="edit"
      {...edit}
      submitLabel="Lưu Version"
      onBack={() => navigate(-1)}
    />
  );
}
