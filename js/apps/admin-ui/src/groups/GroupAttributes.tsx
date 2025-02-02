import GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import {
  AlertVariant,
  PageSection,
  PageSectionVariants,
} from "@patternfly/react-core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { adminClient } from "../admin-client";
import { useAlerts } from "../components/alert/Alerts";
import {
  AttributeForm,
  AttributesForm,
} from "../components/key-value-form/AttributeForm";
import { arrayToKeyValue } from "../components/key-value-form/key-value-convert";
import { convertFormValuesToObject, convertToFormValues } from "../util";
import { useFetch } from "../utils/useFetch";
import { getLastId } from "./groupIdUtils";

export const GroupAttributes = () => {
  const { t } = useTranslation();
  const { addAlert, addError } = useAlerts();
  const form = useForm<AttributeForm>({
    mode: "onChange",
  });

  const location = useLocation();
  const id = getLastId(location.pathname)!;
  const [currentGroup, setCurrentGroup] = useState<GroupRepresentation>();

  useFetch(
    () => adminClient.groups.findOne({ id }),
    (group) => {
      convertToFormValues(group!, form.setValue);
      setCurrentGroup(group);
    },
    [],
  );

  const save = async (attributeForm: AttributeForm) => {
    try {
      const attributes = convertFormValuesToObject(attributeForm).attributes;
      await adminClient.groups.update(
        { id: id! },
        { ...currentGroup, attributes },
      );

      setCurrentGroup({ ...currentGroup, attributes });
      addAlert(t("groupUpdated"), AlertVariant.success);
    } catch (error) {
      addError("groups:groupUpdateError", error);
    }
  };

  return (
    <PageSection variant={PageSectionVariants.light}>
      <AttributesForm
        form={form}
        save={save}
        fineGrainedAccess={currentGroup?.access?.manage}
        reset={() =>
          form.reset({
            attributes: arrayToKeyValue(currentGroup?.attributes!),
          })
        }
      />
    </PageSection>
  );
};
