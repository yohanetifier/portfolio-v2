import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex justify-center items-center relative w-full h-[100vh]">
      <div className="border-2 border-orange-500  w-[35vw] h-[90vh] rounded-xl relative overflow-hidden">
        {['desktop.jpg', 'tesla.jpg', 'holidays.jpg'].map((source, index) => (
          <Image
            key={index}
            src={`/images/${source}`}
            alt={source}
            width={0}
            height={0}
            className="border-2 border-red-500 w-full h-full object-cover"
          />
        ))}
      </div>
      <div className="w-full flex absolute bottom-0 justify-center items-center">
        <h2 className="text-[200px]">CREATIVE AGENCY</h2>
        <span className=" w-[30px] h-[30px] bg-purple-200 rounded-full"></span>
      </div>
    </div>
  );
}
