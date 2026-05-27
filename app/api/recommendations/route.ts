//后端的api接口： 拼装数据 -> 调算法 -> 排序 -> 返回前n个

//从db拉取用户最近的面试历史 + 所有可约的志愿者
//调取lib/recommend.ts的纯函数算分
//把结果以jason的形式返回给前端

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildUserProfile, rankVolunteers, Recommendation } from '@/lib/recommend';

export const dynamic = 'force-dynamic'; //force to dynamic rendering, not cache

export async function GET(req: NextRequest) {
    try{
        //1.parse the query patameters
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get('userId'); // user's NUID
        const topK = Number(searchParams.get('topK') ?? 3); //default recommend 3 volunteers

        if(!userId) {
            return NextResponse.json( {error: 'userId required'} , {status: 400});
        }

        //2.get user recently 10 interview
        const sessions = await prisma.practiceSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {company:true, role:true, interviewType:true}
        })

        //2.personalize： history + algorithm
        if (sessions.length > 0) {
            const volunteers = await prisma.volunteer.findMany({
                where: { availability: 'available' },
                select: { id: true, name: true, company: true, role: true, skills: true, bio: true },
            })

            const profile = buildUserProfile(sessions);
            const recommendations = rankVolunteers(volunteers, profile, topK);
            if(recommendations.length > 0) {
                return NextResponse.json({ 
                    recommendations,
                    profile,
                    source: 'personalized',
                });
            }
        }
        //popular recommendation
        //find each volunteer been booked times and sorting by descending order
        //prisma grammer
        const popularCounts = await prisma.session.groupBy({
            by: ['volunteerId'],
            _count: { volunteerId: true },
            orderBy: { _count: { volunteerId: 'desc' } }, //descending order
            take: topK,
        })

        let popularRecs: Recommendation[] = [];
        if (popularCounts.length > 0) {
            const ids = popularCounts.map(p => p.volunteerId)
            const volunteers = await prisma.volunteer.findMany({
                where: { id: {in: ids} , availability: 'available' },
                select: { id: true, name: true, company: true, role: true, skills: true, bio: true },
            })
            //find many dont prove the return order
            //need to follow the popularcounts reorganize

            const byId = new Map(volunteers.map(v => [v.id, v]));
            popularRecs = popularCounts.map( p => {
                const v = byId.get(p.volunteerId);
                if (!v) return null;
                return {
                    volunteers: v,
                    score: 0,
                    breakdown: { company: 0, role: 0, skills: 0 },
                    reasons: [`Popular on the platform · booked ${p._count.volunteerId} times`],
                }
            })
            .filter((r) : r is Recommendation => r !== null) //filter out nulls
        }

        //4.if not appear any appointment in the platform
        if (popularRecs.length === 0) {
            const newcomers = await prisma.volunteer.findMany({
                where: { availability: 'available' },
                orderBy: { createdAt: 'desc'},
                take: topK,
                select: { id: true, name: true, company: true, role: true, skills: true, bio: true },
            })

            popularRecs = newcomers.map(v => ({
                volunteer: v,
                score: 0,
                breakdown: { company: 0, role: 0, skills: 0 },
                reasons: ['New on the platform'],
            }))
        }

        return NextResponse.json({
            recommendations: popularRecs,
            source: popularCounts.length > 0 ? 'popular' : 'newcomers', 
        })
    }catch (err) {
        console.error('Recommendations error:', err)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}
