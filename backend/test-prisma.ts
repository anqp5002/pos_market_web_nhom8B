import prisma from './src/config/db';

async function main() {
  try {
    const res = await prisma.nhanVien.findUnique({ where: { username: "cashier06" } });
    console.log("findUnique works!", res);
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
main();
