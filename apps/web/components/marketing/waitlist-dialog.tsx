'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';

type Props = {
  triggerLabel: string;
  tierName: string;
  featured?: boolean;
};

export function WaitlistDialog({ triggerLabel, tierName, featured = false }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast({
        variant: 'error',
        title: 'Enter a valid email',
        description: 'We need a working address to reach out when billing is ready.',
      });
      return;
    }
    setSubmitted(true);
    toast({
      variant: 'success',
      title: `Saved your spot — ${tierName}`,
      description: 'We’ll email you when billing is live.',
    });
  }

  function reset() {
    setEmail('');
    setSubmitted(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="mt-6 w-full" variant={featured ? 'default' : 'outline'}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-white/10">
        <DialogHeader>
          <DialogTitle>Join the {tierName} waitlist</DialogTitle>
          <DialogDescription>
            Billing isn’t live yet. Drop your email and we’ll reach out when {tierName} opens up.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>
              Thanks — we’ll be in touch at <span className="text-foreground">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`waitlist-email-${tierName}`}>Work email</Label>
              <Input
                id={`waitlist-email-${tierName}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Join waitlist</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
