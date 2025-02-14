use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Protocol {
    pub protocol_uuid: String,
    pub name: String,
    pub staffs: Vec<String>,
    pub protocol_users: Vec<ProtocolUsers>,
    pub created_at: String,
    pub created_by: String,
    pub quizes: Vec<String>,
    pub total_expense: f64,
    pub contract_address: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ProtocolUsers {
    pub user_uuid: String,
    pub leaderboard_point: i128,
}

impl Protocol {
    pub fn new(name: String, creator_uuid: String) -> Protocol {
        Protocol {
            protocol_uuid: Uuid::new_v4().to_string(),
            name,
            staffs: Vec::new(),
            protocol_users: Vec::new(),
            created_at: chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
            created_by: creator_uuid,
            total_expense: 0.0,
            quizes: Vec::new(),
            contract_address: String::from(" "),
        }
    }

    pub fn add_staff(&mut self, staff_uuid: String) -> bool {
        self.staffs.push(staff_uuid);
        return true;
    }

    pub fn add_protocol_user(&mut self, user_uuid: String) -> bool {
        self.protocol_users.push(ProtocolUsers {
            user_uuid,
            leaderboard_point: 0,
        });
        return true;
    }

    pub fn update_total_expense(&mut self, expense: f64) -> bool {
        self.total_expense += expense;
        return true;
    }

    pub fn add_quiz(&mut self, quiz_uuid: String) -> bool {
        self.quizes.push(quiz_uuid);
        return true;
    }

    pub fn update_protocol_user_leaderboard_point(
        &mut self,
        user_uuid: String,
        leaderboard_point: i128,
    ) -> bool {
        if let Some(protocol_user) = self
            .protocol_users
            .iter_mut()
            .find(|p| p.user_uuid == user_uuid)
        {
            protocol_user.leaderboard_point = leaderboard_point;
            return true;
        } else {
            return false;
        }
    }
}
