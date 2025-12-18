import { Role } from 'src/common/enum/role.enum';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface JwtPayload {
  id: string;
  email: string;
  role?: Role | Role[];
  iat?: number;
  exp?: number;
}
