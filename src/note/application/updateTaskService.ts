import { IAppService } from "src/core/application/IAppService";
import { editTaskDto } from "./dto/editTaskDto";
import { Either } from "src/generics/Either";
import { ITask } from "../domain/repository/ITask";
import { NoteAggregate } from "../domain/noteAggregate";

export class updateTaskService implements IAppService<editTaskDto, string>{
    private taskRepo: ITask;

    constructor(repo: ITask) {
        this.taskRepo = repo;
    }
    async execute(dto: editTaskDto): Promise<Either<Error, string>> {
        const tarea = NoteAggregate.editTask(dto.idTask,dto.text,dto.status);
        if (tarea.isLeft()) {
            return Either.makeLeft<Error, string>(tarea.getLeft());
        }else{
            let result = await this.taskRepo.editTask(dto.idTask,tarea.getRight());
            if(result.isLeft()){
                return result; 
            }
            return Either.makeRight<Error,string>("Resultado "+  result);
        }

    }

}