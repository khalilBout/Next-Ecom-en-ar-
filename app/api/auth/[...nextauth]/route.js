import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/user";
import { connectDB } from "@/utilit/connectDB";
import bcrypt from "bcryptjs";

// NextAuth is leb to auth is next
// إستخدام دالة الهندل من اجل استخدمها كدالة للجلب وارسال بيانات المستخدم في نفس الوقت
// حيث أنه يكن كتابة كل دالة على حدى
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      // الدالة المسؤولة عن التاكد من البايانات ثم تسجيل الدخول
      async authorize(credentials) {
        //Check if the user exists.
        await connectDB();

        try {
          //
          const user = await User.findOne({
            email: credentials.email,
          });

          if (user) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (isPasswordCorrect) {
              delete user.password;
              return user;
            } else {
              throw new Error("Wrong Credentials!");
            }
          } else {
            throw new Error("User not found!");
          }
        } catch (err) {
          throw new Error(err);
        }
      },
    }),

    // GoogleProvider({
    //   // إستخراج البيانات من بروفايل الغوغل والتعديل عليعا بإضافة  دور المستخدم
    //   // وكذا رقم تعريفي لكون بوفايل الغوغل لا يحتوي على رقم  تعريفي
    //   profile(profile) {
    //     let roleUser = "user";
    //     // إستخراج معلومات من ملف البروفايل الخاص بغوغل
    //     return {
    //       ...profile,
    //       id: profile.sub,
    //       role: roleUser,
    //       image: profile.picture,
    //     };
    //   },
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
  ],
  //  الدالة المسؤولة على التغير في البايانات الراجعة  او المستردة والت يمكن الوصول إاليها في التطبيق
  callbacks: {
    // إضافة دور المستخدم والصورة في جانب السرفر
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.image = user.image;
        return token;
      }
      return token;
    },
    //  إضافة دور المستخدم وصورته في جانب الكلاينت
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.image = token.image;
        return session;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
