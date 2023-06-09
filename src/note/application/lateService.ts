import { Either } from "src/generics/Either";
import { createnoteService } from "./createNoteService";
import { CreateNoteDto } from "./dto/CreateNoteDto";
import { INotes } from "../domain/repository/INotes";
import { Inject } from "@nestjs/common";
import { addBodyDto } from "./dto/addBodyDto";
import { IBody } from "../domain/repository/IBody";
import { addBodyToNoteService } from "./addBodyToNoteService";
import { updateBodyDto } from "./dto/updateBodyDto";
import { updateBodyFromNoteService } from "./updateBodyFromNoteService";
import { addTaskDto } from "./dto/addTaskDto";
import { ITask } from "../domain/repository/ITask";
import { addTaskService } from "./addTaskService";
import { editTaskDto } from "./dto/editTaskDto";
import { updateTaskService } from "./updateTaskService";
import { deleteTaskService } from "./deleteTaskService";
import { deleteTaskDto } from "./dto/deleteTaskDto";

export class lateService {
    private notas: createnoteService;
    private body: addBodyToNoteService;
    private editBody: updateBodyFromNoteService;
    private task: addTaskService;
    private editTask: updateTaskService;
    private deleteTask: deleteTaskService;

    constructor(@Inject('INotes') repo: INotes, @Inject('IBody') repoBody: IBody, @Inject('ITask') repoTask: ITask) { 
        this.notas = new createnoteService(repo);
        this.body = new addBodyToNoteService(repoBody);
        this.editBody = new updateBodyFromNoteService(repoBody);
        this.task = new addTaskService(repoTask);
        this.editTask = new updateTaskService(repoTask);
        this.deleteTask = new deleteTaskService(repoTask);
    }

    async execute(body): Promise<Either<Error, string>> {
        let result;
        let idNotanueva;
        for(let x in body){
            switch(body[x].action){
                case "createNote":
                    let dto = new CreateNoteDto(body[x].nota.titulo, body[x].nota.fechaC, body[x].nota.est, body[x].nota.desc);
                    result = await this.notas.execute(dto);
                    idNotanueva = result.getRight();
                    break;
                case "addBody":
                    let idNota;
                    if(body[x].bod.idNota === null){
                        idNota = idNotanueva;
                    }else{
                        idNota = body[x].bod.idNota;
                    }
                    let dtoBody = new addBodyDto(idNota, body[x].bod.text, body[x].bod.img);
                    result = await this.body.execute(dtoBody);
                    break;
                case "updateBody":
                    let editBodyDto = new updateBodyDto(body[x].bod.idBody, body[x].bod.text, body[x].bod.img);
                    result = await this.editBody.execute(editBodyDto);
                    break;
                case "createTask":
                    let idNotaTask;
                    if(body[x].task.idNota === null){
                        console.log("ENTRO");
                        idNotaTask = idNotanueva;
                    }else{
                        idNotaTask = body[x].task.idNota;
                    }
                    let dtoTask = new addTaskDto(idNotaTask, body[x].task.text, body[x].task.status, body[x].task.fechaCreacion);
                    result = await this.task.execute(dtoTask);
                    break;
                case "updateTask":
                    let dtoEditTask = new editTaskDto(body[x].task.text, body[x].task.status, body[x].task.idTask);
                    result = await this.editTask.execute(dtoEditTask);
                    break;
                case "deleteTask":
                    let dtoDeleteTask = new deleteTaskDto(body[x].task.idTask);
                    result = await this.deleteTask.execute(dtoDeleteTask);
                    break;
                default:

                    break;
            }
        }
        return Either.makeRight<Error, string>("Lay creado");
    }
}