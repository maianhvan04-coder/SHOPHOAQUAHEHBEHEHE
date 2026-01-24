import { useToast } from "@chakra-ui/react";
import {
    templateApi
} from "~/api/template.api";

export function useTemplateVersionActions({ type, onSuccess }) {
    const toast = useToast();
    const addVersion = async (payload) => {
        try {
            await templateApi.createTemplateVersion(type, payload);
            toast({
                title: "Version created",
                status: "success",
            });
            onSuccess?.();
        } catch (err) {
            toast({
                title: "Create version failed",
                description: err?.message,
                status: "error",
            });
        }
    };

    const activateVersion = async (version) => {
        try {
            await templateApi.activateTemplateVersion(type, version);
            toast({
                title: `Activated version v${version}`,
                status: "success",
            });
            onSuccess?.();
        } catch (err) {
            toast({
                title: "Activate version failed",
                description: err?.message,
                status: "error",
            });
        }
    };

    return {
        addVersion,
        activateVersion,
    };
}
