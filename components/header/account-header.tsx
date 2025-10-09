import CountrySelect from "../account/country-select";
import UserAccount from "../account/user-account";
import SearchModal from "../modal/search-modal";
import NotificationButton from "../notification/notification-button";
import Header from "./header";

type OverviewHeaderProps = {
  title: string;
  back?: string | 1;
};

export default function AccountHeader({ title, back }: OverviewHeaderProps) {
  return (
    <Header title={title} back={back}>
      <div className="gap-x-4 grid grid-cols-[auto_46px_46px_46px]">
        <CountrySelect />
        <NotificationButton />
        <SearchModal />
        <UserAccount />
      </div>
    </Header>
  );
}
