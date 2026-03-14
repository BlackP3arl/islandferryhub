import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data (in correct order due to foreign keys)
  await prisma.schedule.deleteMany()
  await prisma.routeStop.deleteMany()
  await prisma.route.deleteMany()
  await prisma.operator.deleteMany()

  const operators = [
    {
      name: 'Maafushi Speedboat Co.',
      boatName: 'Sea Eagle 1',
      contactNumber: '+960 337 8801',
      liveLocationUrl: null,
      ticketingUrl: null,
      routes: [
        {
          routeName: 'Standard Route',
          stops: ['Hulhumalé', 'Maafushi'],
          schedule: { days: [0, 1, 2, 3, 4, 5, 6], times: ['07:00', '09:30', '13:00', '16:00'] }
        }
      ],
    },
    {
      name: 'Thulusdhoo Express',
      boatName: 'Island Hopper',
      contactNumber: '+960 337 4422',
      liveLocationUrl: 'https://maps.app.goo.gl/example1',
      ticketingUrl: null,
      routes: [
        {
          routeName: 'Express',
          stops: ['Hulhumalé', 'Dhiffushi', 'Thulusdhoo'],
          schedule: { days: [0, 1, 2, 3, 4, 5, 6], times: ['08:00', '12:00', '17:00'] }
        }
      ],
    },
    {
      name: 'Gulhi & Guraidhoo Transfers',
      boatName: 'Ocean Star',
      contactNumber: '+960 777 2233',
      liveLocationUrl: null,
      ticketingUrl: 'https://book.example.mv/gulhi',
      routes: [
        {
          routeName: 'Morning Route',
          stops: ['Maafushi', 'Gulhi', 'Guraidhoo'],
          schedule: { days: [0, 2, 4, 6], times: ['09:00', '14:30'] }
        },
        {
          routeName: 'Afternoon Route',
          stops: ['Maafushi', 'Gulhi', 'Guraidhoo'],
          schedule: { days: [1, 3, 5], times: ['09:00', '15:00'] }
        }
      ],
    },
    {
      name: 'Villingili Fast Ferry',
      boatName: 'Blue Horizon',
      contactNumber: '+960 300 1122',
      liveLocationUrl: 'https://maps.app.goo.gl/example2',
      ticketingUrl: 'https://book.example.mv/villingili',
      routes: [
        {
          routeName: 'All Day',
          stops: ['Villingili'],
          schedule: { days: [0, 1, 2, 3, 4, 5, 6], times: ['06:30', '07:00', '07:30', '08:00', '12:00', '13:00', '17:00', '18:00', '22:00', '23:00'] }
        }
      ],
    },
    {
      name: 'Fulidhoo Retreat Transfers',
      boatName: 'Sunset Voyager',
      contactNumber: '+960 776 9900',
      liveLocationUrl: null,
      ticketingUrl: null,
      routes: [
        {
          routeName: 'Mon/Wed/Fri',
          stops: ['Hulhumalé', 'Maafushi', 'Fulidhoo'],
          schedule: { days: [1, 3, 5], times: ['08:30', '15:00'] }
        },
        {
          routeName: 'Tue/Thu/Sat/Sun',
          stops: ['Hulhumalé', 'Maafushi', 'Fulidhoo'],
          schedule: { days: [0, 2, 4, 6], times: ['09:30'] }
        }
      ],
    },
    {
      name: 'Dhiffushi Day Tripper',
      boatName: 'Coral Dancer',
      contactNumber: '+960 337 5566',
      liveLocationUrl: 'https://maps.app.goo.gl/example3',
      ticketingUrl: null,
      routes: [
        {
          routeName: 'Daily',
          stops: ['Hulhumalé', 'Dhiffushi'],
          schedule: { days: [0, 1, 2, 3, 4, 5, 6], times: ['08:00', '11:00', '14:30', '17:30'] }
        }
      ],
    },
    {
      name: 'Kaafu Atoll Speedboats',
      boatName: 'Wave Runner',
      contactNumber: '+960 337 8833',
      liveLocationUrl: null,
      ticketingUrl: 'https://book.example.mv/kaafu',
      routes: [
        {
          routeName: 'Weekday Route',
          stops: ['Maafushi', 'Guraidhoo', 'Gulhi', 'Fulidhoo'],
          schedule: { days: [1, 2, 3, 4, 5], times: ['07:30', '13:00'] }
        },
        {
          routeName: 'Weekend Route',
          stops: ['Maafushi', 'Guraidhoo', 'Gulhi', 'Fulidhoo'],
          schedule: { days: [0, 6], times: ['09:00', '14:00'] }
        }
      ],
    },
    {
      name: 'Island Link Maldives',
      boatName: 'Pearl Express',
      contactNumber: '+960 776 4411',
      liveLocationUrl: 'https://maps.app.goo.gl/example4',
      ticketingUrl: 'https://book.example.mv/islandlink',
      routes: [
        {
          routeName: 'Daily Express',
          stops: ['Hulhumalé', 'Thulusdhoo', 'Dhiffushi', 'Maafushi'],
          schedule: { days: [0, 1, 2, 3, 4, 5, 6], times: ['07:00', '10:00', '13:30', '16:30'] }
        }
      ],
    },
  ]

  for (const op of operators) {
    const operator = await prisma.operator.create({
      data: {
        name: op.name,
        boatName: op.boatName,
        contactNumber: op.contactNumber,
        liveLocationUrl: op.liveLocationUrl,
        ticketingUrl: op.ticketingUrl,
      },
    })

    // Create routes for this operator
    for (let ri = 0; ri < op.routes.length; ri++) {
      const routeData = op.routes[ri]
      
      const route = await prisma.route.create({
        data: {
          operatorId: operator.id,
          routeName: routeData.routeName,
          order: ri,
        },
      })

      // Create stops for this route (Male' is always first)
      const allStops = ["Male'", ...routeData.stops]
      for (let si = 0; si < allStops.length; si++) {
        await prisma.routeStop.create({
          data: {
            routeId: route.id,
            island: allStops[si],
            order: si,
          },
        })
      }

      // Create schedule for this route
      await prisma.schedule.create({
        data: {
          routeId: route.id,
          departureTimes: JSON.stringify(routeData.schedule.times),
          daysOfWeek: JSON.stringify(routeData.schedule.days),
        },
      })
    }
  }

  console.log('✅ Database seeded with', operators.length, 'operators')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
