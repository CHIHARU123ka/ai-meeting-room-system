import { prisma } from '../config/database';

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const [
    totalRooms,
    activeRooms,
    totalUsers,
    totalReservations,
    todayReservations,
    weekReservations,
    cancelledThisWeek,
    upcomingReservations,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.reservation.count(),
    prisma.reservation.count({
      where: {
        startTime: { gte: todayStart, lt: todayEnd },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    }),
    prisma.reservation.count({
      where: {
        createdAt: { gte: weekAgo },
      },
    }),
    prisma.reservation.count({
      where: {
        status: 'CANCELLED',
        updatedAt: { gte: weekAgo },
      },
    }),
    prisma.reservation.count({
      where: {
        startTime: { gt: now },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    }),
  ]);

  const cancellationRate = weekReservations > 0
    ? Math.round((cancelledThisWeek / weekReservations) * 100)
    : 0;

  return {
    totalRooms,
    activeRooms,
    totalUsers,
    totalReservations,
    todayReservations,
    weekReservations,
    upcomingReservations,
    cancellationRate,
  };
}

export async function getRoomUsageStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const roomUsage = await prisma.room.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      capacity: true,
      location: true,
      _count: {
        select: {
          reservations: {
            where: {
              startTime: { gte: thirtyDaysAgo },
              status: { in: ['CONFIRMED', 'COMPLETED'] },
            },
          } as any,
        },
      },
      reservations: {
        where: {
          startTime: { gte: thirtyDaysAgo },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return roomUsage.map((room) => {
    const totalHours = room.reservations.reduce((sum, r) => {
      return sum + (r.endTime.getTime() - r.startTime.getTime()) / 3600000;
    }, 0);

    // Max possible hours: 12 business hours x 30 days
    const maxHours = 12 * 30;
    const utilizationRate = Math.round((totalHours / maxHours) * 100);

    return {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      totalBookings: room.reservations.length,
      totalHours: Math.round(totalHours * 10) / 10,
      utilizationRate: Math.min(utilizationRate, 100),
    };
  });
}

export async function getUserActivityStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  // Reservations grouped by day for the last 30 days
  const dailyReservations = await prisma.reservation.groupBy({
    by: ['status'],
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
  });

  // Top bookers
  const topUsers = await prisma.reservation.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const userIds = topUsers.map((u) => u.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, email: true, department: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const topBookers = topUsers.map((entry) => ({
    user: userMap.get(entry.userId),
    bookingCount: entry._count.id,
  }));

  // Peak hours analysis
  const recentReservations = await prisma.reservation.findMany({
    where: {
      startTime: { gte: thirtyDaysAgo },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
    select: { startTime: true },
  });

  const hourCounts: Record<number, number> = {};
  for (const r of recentReservations) {
    const hour = r.startTime.getUTCHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour, 10), count }))
    .sort((a, b) => b.count - a.count);

  return {
    statusBreakdown: dailyReservations.map((d) => ({
      status: d.status,
      count: d._count.id,
    })),
    topBookers,
    peakHours,
  };
}
