import { Injectable } from '@nestjs/common';
import { SocketGateway } from '../socket.gateway';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';

@Injectable()
export class SocketService {
    constructor(private readonly socketGateway: SocketGateway) {}

    
}
