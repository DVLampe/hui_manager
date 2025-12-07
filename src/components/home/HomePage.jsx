'use client';

import { Download, PlayCircle, ShieldCheck, TrendingUp, BellRing } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const HomePage = () => {
  return (
    <div className="bg-white-50 min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-red-800 mb-4">
            Quản lý Hụi thông minh, an toàn và hiệu quả
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            Ứng dụng của chúng tôi giúp bạn quản lý các nhóm Hụi một cách dễ dàng, minh bạch và an toàn. Tham gia cùng hàng ngàn người dùng và trải nghiệm sự tiện lợi ngay hôm nay!
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300 flex items-center space-x-2">
              <Download size={20} />
              <span>Tải về cho Android</span>
            </button>
            <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition duration-300 flex items-center space-x-2">
              <Download size={20} />
              <span>Tải về cho iOS</span>
            </button>
          </div>
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => signIn()}
              className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Đăng nhập
            </button>
            <Link href="/register">
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300">
                Đăng ký
              </button>
            </Link>
          </div>
        </section>

        <section className="mt-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <PlayCircle size={48} className="text-red-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <PlayCircle size={48} className="text-yellow-400" />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-red-800 text-center mb-8">
            Tính năng nổi bật
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingUp size={32} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Quản lý dễ dàng</h3>
              <p className="text-gray-600">
                Tạo và quản lý các nhóm Hụi, theo dõi các kỳ thanh toán và quản lý thành viên một cách dễ dàng.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <ShieldCheck size={32} className="text-yellow-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Minh bạch và an toàn</h3>
              <p className="text-gray-600">
                Tất cả các giao dịch được ghi lại và có thể truy cập bất cứ lúc nào, đảm bảo tính minh bạch và an toàn.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <BellRing size={32} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thông báo tự động</h3>
              <p className="text-gray-600">
                Nhận thông báo tự động về các kỳ thanh toán sắp tới, giúp bạn không bao giờ bỏ lỡ một kỳ thanh toán nào.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
