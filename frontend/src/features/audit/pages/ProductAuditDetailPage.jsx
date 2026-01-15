import React from 'react';
import {
  Box,
  Grid,
  Button,
  useToast,
} from '@chakra-ui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';

import { useProductAuditDetail } from '../hooks/useProductAuditDetail';

// components
import AuditLoading from '~/features/audit/components/AuditLoading';
import AuditError from '~/features/audit/components/AuditError';
import AuditHeader from '~/features/audit/components/AuditHeader';
import AuditActorCard from '~/features/audit/components/AuditActorCard';
import AuditSystemCard from '~/features/audit/components/AuditSystemCard';
import AuditResourceCard from '~/features/audit/components/AuditResourceCard';
import AuditImageCompare from '~/features/audit/components/AuditImageCompare';
import AuditChangeList from '~/features/audit/components/AuditChangeList';

// utils
import { IGNORE_FIELDS } from '~/features/audit/utils/auditUtils';

export default function ProductAuditDetailPage() {
  const { auditId } = useParams();
  const { loading, audit, error } = useProductAuditDetail(auditId);
  const toast = useToast();

  /* ================= COPY ================= */
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã sao chép',
      status: 'success',
      duration: 1500,
      isClosable: true,
    });
  };

  /* ================= STATES ================= */
  if (loading) return <AuditLoading />;
  if (error || !audit) return <AuditError message={error?.message} />;

  /* ================= DATA ================= */
 const rawBefore = audit.changes?.before;
const rawAfter = audit.changes?.after;

const before = rawBefore && typeof rawBefore === 'object' ? rawBefore : {};
const after = rawAfter && typeof rawAfter === 'object' ? rawAfter : {};


let changedFields = [];

if (audit.action === 'update') {
  changedFields = Object.keys({ ...before, ...after }).filter(
    (key) =>
      !IGNORE_FIELDS.includes(key) &&
      JSON.stringify(before[key]) !== JSON.stringify(after[key])
  );
}

if (audit.action === 'create') {
  changedFields = Object.keys(after).filter(
    (key) => !IGNORE_FIELDS.includes(key)
  );
}

if (audit.action === 'delete') {
  changedFields = Object.keys(before).filter(
    (key) => !IGNORE_FIELDS.includes(key)
  );
}


  const beforeImages = before.images || (before.image ? [before.image] : []);
  const afterImages = after.images || (after.image ? [after.image] : []);
  /* ================= UI ================= */
  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      {/* BACK */}
      <Button
        leftIcon={<ArrowLeftIcon width={18} />}
        variant="ghost"
        mb={6}
        onClick={() => window.history.back()}
      >
        Quay lại
      </Button>

      {/* HEADER */}
      <AuditHeader audit={audit} />

      {/* INFO CARDS */}
      <Grid
        templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }}
        gap={6}
        mb={6}
      >
        <AuditActorCard
          actor={audit.actorId}
          roles={audit.actorRoles}
          onCopy={handleCopy}
        />

        <AuditSystemCard
          audit={audit}
          onCopy={handleCopy}
        />

        <AuditResourceCard
          audit={audit}
          onCopy={handleCopy}
        />
      </Grid>

      {/* IMAGE COMPARE */}
     <AuditImageCompare
  action={audit.action}
  before={beforeImages}
  after={afterImages}
/>


      {/* CHANGE LIST */}
      <AuditChangeList
      action={audit.action}
        before={before}
        after={after}
        
      />
    </Box>
  );
}
