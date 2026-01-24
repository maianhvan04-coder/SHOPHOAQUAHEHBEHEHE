import TemplateEditorLayout from "~/components/template/TemplateEditorLayout";
import { useTemplateCreate } from "~/features/template/hooks/useTemplateCreate";
import { useNavigate } from "react-router-dom";

export default function TemplateCreatePage() {
  const create = useTemplateCreate();
  const navigate = useNavigate();

  return (
    <TemplateEditorLayout
      mode="create"
      {...create}
      submitLabel="Tạo Template"
      onBack={() => navigate(-1)}
    />
  );
}
