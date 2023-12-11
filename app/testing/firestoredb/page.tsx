'use client';

export default function Page() {

    const addData = async () => {
        // console.log('entered fetching student skill function')
        try {
          const response = await fetch('/api/firestoreTest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log("Successfully inputted data")
        } catch (error) {
          console.error('Error inputting data:', error);
        }
    }

    return (
      <main className="flex min-h-screen flex-col p-6">
        <div className="flex h-20 shrink-0 items-end rounded-lg bg-388a91 p-4 md:h-40">
        </div>
        <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
          <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <img src="/images/eduflow_logo.svg" alt="EduFlow logo" style={{ height: '250px' }} />
            <p className={`text-xl text-gray-800 md:text-3xl md:leading-normal`}>
              Personalised learning for every student
            </p>
            <button
              onClick={addData}
              className="flex items-center gap-5 self-start rounded-lg bg-388a91 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-17363f md:text-base"
              >
                Add new stuff
              </button>
          </div>
          <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
            <img src="/images/eduflow_screens.svg" alt="EduFlow Screens" style={{ height: '500px' }} />
          </div>
        </div>
      </main>
    );
}

