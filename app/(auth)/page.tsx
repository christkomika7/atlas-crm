import Logo from "@/components/logo";
import Image from "next/image";
import SigninForm from "./_component/signin-form";

export default function SigninPage() {
  return (
    <div className="grid grid-cols-2 min-h-screen">
      <div className="flex flex-col p-8">
        <Logo />
        <div className="flex flex-col flex-1 justify-center items-center pb-16">
          <h2 className="mb-4 font-bold text-3xl uppercase">ATLAS</h2>
          <p className="mb-8 text-neutral-600 text-sm text-center">
            Bienvenue, veuillez vous connecter.
          </p>
          <SigninForm />
        </div>
      </div>
      <div className="relative grid w-full h-full">
        <div className="top-0 left-0 absolute flex justify-center items-center w-full h-full">
          <div className="relative bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-4xl w-[412px] h-[520px]">
            <h2 className="p-6 font-bold text-white text-3xl">
              Votre espace personnel, accessible en toute simplicité
            </h2>
            <div className="bottom-0 left-22 absolute w-full h-fit">
              <Image src="/mockup.png" alt="Mockup" width={570} height={485} />
            </div>
          </div>
        </div>
        <Image
          src="/bg.png"
          alt="Signin background "
          width={500}
          height={500}
          unoptimized
          className="w-full h-screen object-cover"
        />
      </div>
    </div>
  );
}
