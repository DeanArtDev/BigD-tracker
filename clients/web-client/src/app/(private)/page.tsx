'use client';

import { Main } from '@/app/_ui/main';
import { routes } from '@/shared/routes';
import { UserSettings } from '@/widget/user-settings';
import { ApplicationButton } from './_ui/application-button';
import { Header } from './_ui/header';

export default function ApplicationsPage() {
  return (
    <div className="grid min-h-screen grid-rows-[64px_1fr]">
      <Header content={<UserSettings className="ml-auto" />} />

      <Main className="p-10">
        <ul className="grid mx-auto grid-cols-[repeat(auto-fit,80px)] justify-center max-w-[600px] h-fit gap-10">
          <li className="flex flex-col items-center justify-between gap-2">
            <ApplicationButton route={routes.planner.path} name="Планировщик" />
          </li>
        </ul>
      </Main>
    </div>
  );
}
