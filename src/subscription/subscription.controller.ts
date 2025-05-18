import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to weather updates' })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiCreatedResponse({
    description: 'Subscription successful. Confirmation email sent.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiConflictResponse({ description: 'Email already subscribed' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async subscribe(@Body() dto: CreateSubscriptionDto) {
    const token = await this.subscriptionService.subscribe(dto);

    return {
      message: 'Subscription successful. Confirmation email sent.',
      token,
    };
  }

  @Get('confirm/:token')
  @ApiOperation({ summary: 'Confirm your email address' })
  @ApiParam({ name: 'token', description: 'Token from confirmation email' })
  @ApiOkResponse({ description: 'Subscription confirmed successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'Token not found.' })
  async confirm(@Param('token') token: string) {
    const result = await this.subscriptionService.confirmSubscription(token);
    if (!result) throw new NotFoundException('Invalid or expired token');
    return { message: 'Subscription confirmed successfully' };
  }

  @Get('unsubscribe/:token')
  @ApiOperation({
    summary:
      'Unsubscribes an email from weather updates using the token sent in emails.',
  })
  @ApiParam({ name: 'token', description: 'Unsibscribe token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unsubscribed.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token',
  })
  @ApiResponse({
    status: 404,
    description: 'Token not found.',
  })
  async unsubscribe(@Param('token') token: string) {
    const result = await this.subscriptionService.unsubscribe(token);
    if (!result)
      throw new NotFoundException('Subscription not found or invalid token');
    return { message: 'Successfully unsubscribed' };
  }
}
