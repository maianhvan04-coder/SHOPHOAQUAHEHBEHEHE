import TemplateEditorLayout from "./TemplateEditorLayout";
import { useTemplateVersionForm } from "~/features/template/hooks/useTemplateVersionForm";

export default function TemplateVersionEditor({
  initialData,
  mode = "edit",        // "edit" | "create"
  hideType = false,     // modal = true
  hideHeader = false,   // modal = true
  submitLabel,
  onSubmit,
  onBack,
  onPreview,
}) {
  const {
    form,
    errors,
    loading,
    updateField,
    updateSection,
    addSection,
    removeSection,
    submit,
  } = useTemplateVersionForm({
    initialData,
    onSubmit,
  });

  return (
    <TemplateEditorLayout
      form={form}
      errors={errors}
      loading={loading}
      updateField={updateField}
      updateSection={updateSection}
      addSection={addSection}
      removeSection={removeSection}
      submit={submit}
      submitLabel={submitLabel}
      onBack={onBack}
      onPreview={onPreview}
      mode={mode}
      hideType={hideType}
      hideHeader={hideHeader}
    />
  );
}
