import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash, Archive } from 'lucide-react';
import { useDeleteNote, useUpdateNote } from '@/hooks/use-notes';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Generic Confirmation Dialog Component
interface ConfirmationDialogProps {
  triggerText: string;
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  triggerClassName?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  confirmClassName?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
}

export function ConfirmationDialog({
  triggerText,
  triggerVariant = 'outline',
  triggerClassName,
  icon,
  title,
  description,
  confirmText = 'Confirm',
  confirmVariant = 'default',
  confirmClassName,
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
  disabled = false,
}: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Keep dialog open on error so user can retry
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={triggerVariant} 
          className={triggerClassName}
          disabled={disabled}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader className="flex flex-row items-center gap-2">
          {icon && (
            <div className="size-12 bg-muted rounded-lg p-2 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="flex flex-col gap-2 text-start">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading} onClick={handleCancel}>
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className={confirmClassName}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Note-specific Dialog Component (wrapper around ConfirmationDialog)
type NoteDialogType = 'deleteNote' | 'archiveNote';

interface NoteDialogProps {
  triggerText: string;
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  triggerClassName?: string;
  type: NoteDialogType;
  noteId: string;
  onSuccess?: () => void;
}

export function NoteDialog({
  triggerText,
  triggerVariant = 'outline',
  triggerClassName,
  type,
  noteId,
  onSuccess,
}: NoteDialogProps) {
  const router = useRouter();
  const deleteNoteMutation = useDeleteNote();
  const updateNoteMutation = useUpdateNote();

  const dialogConfig = {
    deleteNote: {
      icon: <Trash />,
      title: 'Delete Note',
      description: 'Are you sure you want to permanently delete this note? This action cannot be undone.',
      confirmText: 'Delete',
      confirmClassName: 'bg-red-500 text-white hover:bg-red-600',
      confirmVariant: 'destructive' as const,
    },
    archiveNote: {
      icon: <Archive />,
      title: 'Archive Note',
      description: 'Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime.',
      confirmText: 'Archive',
      confirmClassName: 'bg-blue-500 text-white hover:bg-blue-600',
      confirmVariant: 'default' as const,
    },
  };

  const config = dialogConfig[type];
  const isLoading = deleteNoteMutation.isPending || updateNoteMutation.isPending;

  const handleConfirm = async () => {
    if (type === 'deleteNote') {
      await deleteNoteMutation.mutateAsync(noteId);
      router.push('/dashboard');
    } else if (type === 'archiveNote') {
      await updateNoteMutation.mutateAsync({
        id: noteId,
        data: { isArchived: true },
      });
    }
    onSuccess?.();
  };

  return (
    <ConfirmationDialog
      triggerText={triggerText}
      triggerVariant={triggerVariant}
      triggerClassName={triggerClassName}
      icon={config.icon}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      confirmVariant={config.confirmVariant}
      confirmClassName={config.confirmClassName}
      isLoading={isLoading}
      onConfirm={handleConfirm}
    />
  );
}
