import { Badge } from "../ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { ProgressDemo } from "./ProgressDemo";
import { Medal, Check, Lock } from "lucide-react";
import React from "react";

type Milestone = {
  tier: string;
  goal: string;
  unlocked?: string;
  progress: number;
};

interface MilestoneProgressProps {
  milestones: Milestone[];
  currentMilestone: number;
}

const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  milestones,
  currentMilestone,
}) => {
  return (
    <div className="w-full  ">
      <ul className="space-y-6">
        {milestones.map((milestone, index) => (
          <li key={index} className="flex space-x-4">
            {/* Indicator */}
            <div className="w-10 h-10 rounded-full  flex-ic justify-center text-white">
              {index < currentMilestone ? (
                <Check className="notfi-icon bg-emerald-400 " />
              ) : (
                <div className="flex items-center justify-center bg-gray-300 notfi-icon">
                  {index}
                </div>
              )}
            </div>

            {/* Milestone Details */}

            <Card
              className={`flex-1 ${
                index < currentMilestone
                  ? "bg-gradient-to-r from-emerald-400/10 to-white"
                  : "bg-white"
              }`}
            >
              <CardHeader className="flex-jb-ic flex-row !pb-3 ">
                <div className="space-y-2">
                  <CardTitle className="text-dark ">{milestone.tier}</CardTitle>
                  <CardDescription className="text-gray-bold">
                    {milestone.goal}
                  </CardDescription>
                </div>

                {/* Status Label */}
                <Badge
                  variant={
                    index < currentMilestone ? "customGreen" : "customGray"
                  }
                >
                  {index < currentMilestone
                    ? "Completed"
                    : index === currentMilestone
                    ? `In Progress 
                    (${milestone.progress}%)`
                    : "Locked"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestone.unlocked && (
                  <p className="text-gray  flex-ic gap-2">
                    {milestone.tier === "Bronze Tier" ? (
                      <Medal className="notfi-icon bg-orange-500/20 text-orange-500" />
                    ) : milestone.tier === "Silver Tier" ? (
                      <Medal className="notfi-icon bg-rd-gray" />
                    ) : milestone.tier === "Gold Tier" ? (
                      <Medal className="notfi-icon bg-yellow-500/20 text-yellow-500" />
                    ) : (
                      <Lock className="notfi-icon bg-rd-gray" />
                    )}
                    Unlocked: {milestone.unlocked}
                  </p>
                )}

                {index === currentMilestone && (
                  <div className="">
                    <ProgressDemo
                      value={100 - milestone.progress}
                      className="progress-purple-fill"
                    />
                    <p className="text-gray text-right">
                      {100 - milestone.progress}% complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MilestoneProgress;
