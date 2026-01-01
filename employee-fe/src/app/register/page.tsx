'use client';

import RegisterForm from "@/components/register-form";
import { School } from "lucide-react";
import { RegisterCredentials, useRegisterMutation } from '@/store/api/auth-api';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const [login, { isLoading }] = useRegisterMutation();

  const submitForm = async (values: RegisterCredentials) => {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      }).unwrap();
      if (result.data) {
        toast.success('Register berhasil', {
          duration: 1000,
          onAutoClose: () => {
            router.push(ROUTES.LOGIN);
          },
        });
      }
    } catch (error: any) {
      toast.error("Gagal register, " + error.data?.info)
    }
  };

  return (
    <div className="flex mt-10 md:mt-0 md:h-screen w-full items-center justify-center p-6 md:p-10 overflow-hidden">
      <div className="w-full max-w-sm">
        <a href="https://kaldemik.com">
          <div className="font-bold text-center pb-4 text-lg">
            <div className="bg-sidebar-primary dark:text-white text-primary-foreground flex size-10 items-center justify-center rounded-md mx-auto mb-1">
              <School className="size-6" />
            </div>
            Kelola Akademik
          </div>
        </a>
        <RegisterForm
          onSubmit={submitForm}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Page;
