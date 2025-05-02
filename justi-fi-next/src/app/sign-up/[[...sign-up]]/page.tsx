import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
      <>
     <div className="flex mt-12 w-full items-center justify-center bg-background sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16">
        <SignUp />
        </div>
      </>
    )
}