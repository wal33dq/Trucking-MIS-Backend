import { Controller, Get, Param, Res, NotFoundException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { normalize } from 'path';
import { lookup } from 'mime-types';

@Controller('api/documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  @Get(':filename')
  findDocument(@Param('filename') filename: string, @Res() res: Response) {
    this.logger.log(`Request received for document: ${filename}`);
    
    // Properly decode filename
    const decodedFilename = decodeURIComponent(filename);
    const filePath = normalize(join(__dirname, '..', '..', 'uploads', decodedFilename));
    this.logger.log(`Looking for file at path: ${filePath}`);

    try {
      // Check if file exists
      if (!existsSync(filePath)) {
        this.logger.error(`File not found at path: ${filePath}`);
        throw new NotFoundException(`File not found: ${decodedFilename}`);
      }
    } catch (error) {
      this.logger.error(`Error accessing file: ${error.message}`, error.stack);
      throw new NotFoundException(`File access error: ${decodedFilename}`);
    }

    const mimeType = lookup(decodedFilename) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    // For better download experience
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(decodedFilename)}"`);
    
    // For caching (optional but recommended)
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const fileStream = createReadStream(filePath);
    fileStream.on('error', (error) => {
        this.logger.error(`Error streaming file: ${decodedFilename}`, error.stack);
        if (!res.headersSent) {
            res.status(500).send('Error streaming file');
        }
    });
    
    this.logger.log(`Streaming file: ${decodedFilename} with MIME type: ${mimeType}`);
    fileStream.pipe(res);
  }
}