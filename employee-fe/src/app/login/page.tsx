'use client';

import LoginForm from "@/components/login-form";
import { School } from "lucide-react";
import { useDispatch } from 'react-redux';
import { LoginCredentials, useLoginMutation } from '@/store/api/auth-api';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { setToken, setUserInfo } from '@/store/auth-slice';
import { toast } from "sonner";

const Page = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const submitForm = async (values: LoginCredentials) => {
    try {
      const result = await login(values).unwrap();
      if (result.data.token) {
        dispatch(setToken(result.data.token));
        dispatch(setUserInfo({
          user_id: result.data.id,
          role: result.data.role_id,
          email: result.data.email,
        }));

        toast.success('Login berhasil', {
          duration: 1000,
          onAutoClose: () => {
            router.push(ROUTES.ADMIN.DASHBOARD);
          },
        });
      }
    } catch (error: any) {
      toast.error("Gagal login, " + error.data?.info)
    }
  };

  return (
    <div className="flex mt-18 md:mt-0 md:h-screen w-full items-center justify-center p-6 md:p-10 overflow-hidden">
      <div className="w-full max-w-sm">
        <a href="https://kaldemik.com">
          <div className="font-bold text-center pb-4 text-lg">
            <div className="bg-sidebar-primary dark:text-white text-primary-foreground flex size-10 items-center justify-center rounded-md mx-auto mb-1">
              <School className="size-6" />
            </div>
            Kelola Akademik
          </div>
        </a>
        <LoginForm
          onSubmit={submitForm}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Page;
