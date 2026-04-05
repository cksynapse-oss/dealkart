"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Loader2, Save, Trash2, User, Lock } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
  mobile: z.string().optional().refine(
    (value) => {
      if (!value || value.trim() === "") return true;
      return /^[+]?[0-9\s-]{10,15}$/.test(value.trim());
    },
    {
      message: "Enter a valid phone number (10-15 digits, with optional + and spaces)",
    }
  ),
  dbaName: z.string().trim().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type SettingsFormProps = {
  profile: {
    fullName: string;
    email: string;
    mobile: string | null;
    dbaName: string | null;
    businessLegalName: string | null;
  };
  userId: string;
  sellerProfileId: string;
};

export function SettingsForm({ profile, userId, sellerProfileId }: SettingsFormProps) {
  const supabase = createClient();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      mobile: profile.mobile || "",
      dbaName: profile.dbaName || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleProfileSubmit = profileForm.handleSubmit(async (values) => {
    setProfileLoading(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: values.fullName.trim(),
          mobile: values.mobile || null,
        })
        .eq("id", userId);

      if (profileError) {
        toast.error(profileError.message);
        return;
      }

      // Update seller_profiles table
      const { error: sellerError } = await supabase
        .from("seller_profiles")
        .update({
          dba_name: values.dbaName?.trim() || null,
        })
        .eq("id", sellerProfileId);

      if (sellerError) {
        toast.error(sellerError.message);
        return;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  });

  const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
    setPasswordLoading(true);
    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: values.currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  });

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal and business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...profileForm.register("fullName")}
                  aria-invalid={!!profileForm.formState.errors.fullName}
                />
                {profileForm.formState.errors.fullName?.message && (
                  <p className="text-sm text-red-600">
                    {profileForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mobile">Phone Number (Optional)</Label>
                <Input
                  id="mobile"
                  placeholder="+91 98765 43210"
                  {...profileForm.register("mobile")}
                  aria-invalid={!!profileForm.formState.errors.mobile}
                />
                {profileForm.formState.errors.mobile?.message && (
                  <p className="text-sm text-red-600">
                    {profileForm.formState.errors.mobile.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbaName">Display Business Name (Optional)</Label>
                <Input
                  id="dbaName"
                  placeholder="How your business appears to buyers"
                  {...profileForm.register("dbaName")}
                  aria-invalid={!!profileForm.formState.errors.dbaName}
                />
                {profileForm.formState.errors.dbaName?.message && (
                  <p className="text-sm text-red-600">
                    {profileForm.formState.errors.dbaName.message}
                  </p>
                )}
              </div>
            </div>
            {profile.businessLegalName && (
              <div className="space-y-2">
                <Label>Legal Business Name</Label>
                <Input
                  value={profile.businessLegalName}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Legal business name cannot be changed here
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="h-11"
              disabled={profileLoading}
            >
              {profileLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword")}
                aria-invalid={!!passwordForm.formState.errors.currentPassword}
              />
              {passwordForm.formState.errors.currentPassword?.message && (
                <p className="text-sm text-red-600">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword")}
                aria-invalid={!!passwordForm.formState.errors.newPassword}
              />
              {passwordForm.formState.errors.newPassword?.message && (
                <p className="text-sm text-red-600">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register("confirmPassword")}
                aria-invalid={!!passwordForm.formState.errors.confirmPassword}
              />
              {passwordForm.formState.errors.confirmPassword?.message && (
                <p className="text-sm text-red-600">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="outline"
              className="h-11"
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="size-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="destructive" className="h-11">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account, listings, and all associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="mt-3 text-sm text-muted-foreground">
            Contact support if you need help with account deletion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
