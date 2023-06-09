import { Repository } from "typeorm";
import { Either } from "../../generics/Either";
import { IDNota } from "../domain/valueObjects/IDNota";
import { INotes } from "../domain/repository/INotes";
import { NoteAggregate } from "../domain/noteAggregate";
import { NoteEntity } from "./entities/note_entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Optional } from "../../generics/Optional";
import { bodyEntity } from "./entities/body_entity";
import { body } from "../domain/entities/body";
import { task } from "../domain/entities/task";

@Injectable()
export class adapterNoteRepository  implements INotes{
    constructor(
        @InjectRepository(NoteEntity)
        private readonly repositorio: Repository<NoteEntity>,
    ) {}

    async buscarNota(id: string): Promise<Either<Error, NoteAggregate>> {
        const result = await this.repositorio.find({ 
            where: {
                idNota: id
            }, 
            relations: {
                body: true,
                task: true
            }
        });
        if (result.length == 0) {
            return Either.makeLeft<Error, NoteAggregate>(new Error('No se encontro la nota'));  
        }
        let aux = NoteAggregate.create(result[0].tituloNota, result[0].fechaNota,result[0].estadoNota,result[0].descripcionNota, result[0].idNota);
        if(result[0].body.length != 0){
            for(let i=0;i<result[0].body.length;i++){
                const bo = body.create(result[0].idNota,result[0].body[i].fechaBody ,result[0].body[i].text, result[0].body[i].imagen,result[0].body[i].IDbody);
                if(bo.isRight()){
                    aux.getRight().setbodyNota(bo.getRight());
                }
            }

        } else if (result[0].task.length != 0) {
            for(let i=0;i<result[0].task.length;i++){
                const ta = task.createTask(result[0].task[i].title,result[0].task[i].fechaCreacion, result[0].task[i].status,result[0].idNota);
                if(ta.isRight()){
                    aux.getRight().settareaNota(ta.getRight());
                }
            }
        }  

        return Either.makeRight<Error, NoteAggregate>(aux.getRight());
    }

    async saveNota(nota: NoteAggregate): Promise<Either<Error, string>> {

        const aux: NoteEntity = {
            idNota: nota.getid().getIDNota(),
            estadoNota: nota.getestadoNota().getEstado(),
            fechaNota: nota.getfechaNota().getFecha(),
            tituloNota: nota.gettituloNota().getTituloNota(),
            descripcionNota: nota.getdescripcionNota().getDescripcion(),
            user: "1",
            body: [],
            task: []
        };
        try{
            const resultado = await this.repositorio.save(aux);
            return Either.makeRight<Error,string>(resultado.idNota);
        }catch(error){
            return Either.makeLeft<Error,string>(error);
        }
    }

    
    async editNota(id:string, nota: NoteAggregate): Promise<Either<Error, string>> {
        let noteToUpdate : NoteEntity;
        noteToUpdate = await this.repositorio.findOneBy({
            idNota: id,
        })

        const note = new Optional<NoteEntity>(noteToUpdate);

        if(!note.hasvalue()){
            return Either.makeLeft<Error,string>((new Error('La nota no existe')));
        }

        noteToUpdate.estadoNota = nota.getestadoNota().getEstado();
        noteToUpdate.fechaNota = nota.getfechaNota().getFecha();
        noteToUpdate.tituloNota = nota.gettituloNota().getTituloNota();
        noteToUpdate.descripcionNota = nota.getdescripcionNota().getDescripcion();

        try{
            const resultado = await this.repositorio.save(noteToUpdate);
            return Either.makeRight<Error,string>(resultado.tituloNota);
        }catch(error){
            return Either.makeLeft<Error,string>(error);
        }
    }

    async deleteNota(id: string): Promise<Either<Error, string>> {
        let noteToDelete: NoteEntity;
        noteToDelete = await this.repositorio.findOneBy({
            idNota: id,
        })

        const note = new Optional<NoteEntity>(noteToDelete);

        if (!note.hasvalue()) {
            return Either.makeLeft<Error, string>((new Error('La nota no existe')));
        }

        try {
            const resultado = await this.repositorio.delete(noteToDelete);
            return Either.makeRight<Error, string>('Se elimino la nota exitosamente');
        }catch (error) {
            return Either.makeLeft<Error, string>(error);
        }
    }

  

}