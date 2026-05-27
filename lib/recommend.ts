//using pure-rule score
//1.输入数据 -> 输出推荐结果

//  score = 0.5 × 公司匹配 + 0.3 × 角色匹配 + 0.2 × 技能匹配
//   每一项都是 0~1 的小数，总分也是 0~1

//form each score then get n ranking

//data flow: practiceinput （聚合）- userprofile -> (匹配) -> recommendation 最终输出
//type defination
//user practice one interviews
//用户练习历史
export type PracticeInput = {
    company: string;
    role: string;
    interviewType: string;
}

//volunteer
export type VolunteerInput = {
    id: string;
    name: string;
    company: string | null;
    role: string | null;
    skills: string | null;
    bio?: string | null;
}

//bio string can be nonexistent , if exits can be string or null

//user profile
//typescript define by itself and key value type abbreviations
//把历史记录去压缩成一个偏好画像
export type UserProfile = {
    companies: Record<string, number>; // { Google: 0.67, Amazon: 0.33 }
    roles: Record<string, number>;
    types: Record<string, number>;
}

//single recommendations result
export type Recommendation = {
    volunteer: VolunteerInput;
    score: number; // 0-1总分
    breakdown: { company: number; role: number; skills: number }; // 每项的具体分数
    reasons: string[]; // 推荐理由
}


//constant

const WEIGHTS = { company:0.5, role:0.3, skills:0.2};

//用于技能匹配那一项
const TYPE_TO_KEYWORDS: Record<string, string[]> = {
    "Technical":     ["algorithm", "coding", "data structure", "leetcode", "DSA"],
    "System Design": ["system design", "architecture", "scalability", "distributed"],
    "Behavioral":    ["communication", "leadership", "STAR", "teamwork"],
    "HR":            ["culture fit", "negotiation", "salary"],
  };



//1)把 用户的面试历史聚合成画像
//every interview exercise + 1 then standard to 0-1
export function buildUserProfile(sessions: PracticeInput[]): UserProfile {
    const profile: UserProfile = { companies: {}, roles: {}, types: {} };
    if (sessions.length === 0) return profile;

    //count number
    for (const s of sessions) {
        profile.companies[s.company]      = (profile.companies[s.company]      ?? 0) + 1;
        profile.roles[s.role]             = (profile.roles[s.role]             ?? 0) + 1;
        profile.types[s.interviewType]    = (profile.types[s.interviewType]    ?? 0) + 1;
    }

    //standardlization : value / total 
    const total = sessions.length;
    for (const k of Object.keys(profile.companies)) profile.companies[k] /= total;
    for (const k of Object.keys(profile.roles))     profile.roles[k]     /= total;
    for (const k of Object.keys(profile.types))     profile.types[k]     /= total;
    return profile;

}


//score for each volunteer
export function scoreVolunteer(volunteer: VolunteerInput, profile: UserProfile): Recommendation {
    const reasons: string[] = [];
    //calcuate the company score，role score， skills score
    //company match
    const companyScore = volunteer.company ? (profile.companies[volunteer.company]?? 0 ) : 0;
    if (companyScore > 0) {
        reasons.push(`used to work in ${volunteer.company} before, which is highly related to your target conpanies`);
    }

    //role match
    const roleScore = volunteer.role ? (profile.roles[volunteer.role] ?? 0) : 0;
    if (roleScore > 0) {
      reasons.push(`This role "${volunteer.role}" is matched to your target directions`);                
    }

    //skills match
    //check if volunteers skills if hit this keywords
    const skillsLower = (volunteer.skills ?? "").toLowerCase();
    let skillsScore = 0;
    const hitTypes: string[] = [];
    for (const [type, weight] of Object.entries(profile.types)) {
        const keywords = TYPE_TO_KEYWORDS[type] ?? [];
        const hit = keywords.some( (kw) => skillsLower.includes(kw.toLowerCase()));
        if (hit) {
            skillsScore += weight;
            hitTypes.push(type);
        }
    }
    if (skillsScore > 0) {
        reasons.push(`Skills related to your target interview types (${hitTypes.join(", ")})`);

    }

    //weighted total score
    const score = 
        WEIGHTS.company * companyScore + 
        WEIGHTS.role * roleScore +
        WEIGHTS.skills * skillsScore;

    return {
        volunteer,
        score,
        breakdown: { company: companyScore, role: roleScore, skills: skillsScore },
        reasons,
    };
}

//rank for all vonlunteers 
//rankvolunteers encapulate the scorevolunteer function
export function rankVolunteers(
    volunteers: VolunteerInput[],
    profile: UserProfile,
    topN = 5
): Recommendation[] {
    return volunteers
        .map( v => scoreVolunteer(v,profile))
        .filter( r => r.score > 0)
        .sort( (a,b) => b.score - a.score)
        .slice(0,topN)    
}


